// Axios global setup: retry on 429/503 with backoff and tiny GET cache to avoid bursts
import axios from "axios";

let initialized = false;

export function initHttp() {
  if (initialized) return;
  initialized = true;

  // Simple in-memory cache for idempotent GETs (TTL ms)
  const GET_TTL = 5000; // 5s burst cache
  const MAX_CACHE_SIZE = 100;
  const cache = new Map(); // key -> { at:number, payload:{ data, headers, status, statusText } }

  const sortValue = (val) => {
    if (Array.isArray(val)) return val.map(sortValue);
    if (val && typeof val === "object") {
      return Object.keys(val)
        .sort()
        .reduce((acc, k) => {
          acc[k] = sortValue(val[k]);
          return acc;
        }, {});
    }
    return val;
  };

  const stableStringify = (obj) => {
    if (!obj) return "";
    if (typeof obj !== "object") return String(obj);
    return JSON.stringify(sortValue(obj));
  };

  const makeKey = (config) => {
    const url = config.url || "";
    const method = (config.method || "get").toLowerCase();
    const params = stableStringify(config.params);
    // do not cache body
    return `${method}:${url}?${params}`;
  };

  const prune = () => {
    const now = Date.now();
    for (const [k, v] of cache.entries()) {
      if (now - v.at > GET_TTL) cache.delete(k);
    }
  };
  setInterval(prune, GET_TTL);

  axios.interceptors.request.use((config) => {
    if ((config.method || "get").toLowerCase() === "get") {
      const key = makeKey(config);
      const hit = cache.get(key);
      if (hit && Date.now() - hit.at < GET_TTL) {
        // Attach a flag so response interceptor can short-circuit
        config.__fromCache = true;
        const payload = hit.payload || {
          data: hit.data,
          headers: {},
          status: 200,
          statusText: "OK",
        };
        config.adapter = async () => ({
          data: payload.data,
          status: payload.status ?? 200,
          statusText: payload.statusText ?? "OK",
          headers: payload.headers ?? {},
          config,
          request: undefined,
        });
      }
    }
    return config;
  });

  axios.interceptors.response.use(
    (response) => {
      // Cache GET responses briefly
      const cfg = response.config || {};
      if (!cfg.__fromCache && (cfg.method || "get").toLowerCase() === "get") {
        const key = makeKey(cfg);
        cache.set(key, {
          at: Date.now(),
          payload: {
            data: response.data,
            headers: response.headers ?? {},
            status: response.status,
            statusText: response.statusText,
          },
        });
        while (cache.size > MAX_CACHE_SIZE) {
          const first = cache.keys().next().value;
          cache.delete(first);
        }
      }
      return response;
    },
    async (error) => {
      const cfg = error?.config || {};
      const status = error?.response?.status;
      const shouldRetry = status === 429 || status === 503;
      if (!shouldRetry) return Promise.reject(error);

      cfg.__retryCount = cfg.__retryCount || 0;
      const maxRetries = 3;
      if (cfg.__retryCount >= maxRetries) return Promise.reject(error);

      cfg.__retryCount += 1;
      const base = 500; // ms
      const delay = base * Math.pow(2, cfg.__retryCount - 1) + Math.floor(Math.random() * 250);
      await new Promise((res) => setTimeout(res, delay));
      return axios.request(cfg);
    }
  );
}

export default initHttp;

