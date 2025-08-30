// Axios global setup: retry on 429/503 with backoff and tiny GET cache to avoid bursts
import axios from "axios";

let initialized = false;

export function initHttp() {
  if (initialized) return;
  initialized = true;

  // Simple in-memory cache for idempotent GETs (TTL ms)
  const GET_TTL = 5000; // 5s burst cache
  const cache = new Map(); // key -> { at:number, data:any }

  const makeKey = (config) => {
    const url = config.url || "";
    const method = (config.method || "get").toLowerCase();
    const params = config.params ? JSON.stringify(config.params) : "";
    // do not cache body
    return `${method}:${url}?${params}`;
  };

  axios.interceptors.request.use((config) => {
    if ((config.method || "get").toLowerCase() === "get") {
      const key = makeKey(config);
      const hit = cache.get(key);
      if (hit && Date.now() - hit.at < GET_TTL) {
        // Attach a flag so response interceptor can short-circuit
        config.__fromCache = true;
        config.adapter = async () => ({
          data: hit.data,
          status: 200,
          statusText: "OK",
          headers: {},
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
        const key = `${(cfg.method || "get").toLowerCase()}:${cfg.url}?${cfg.params ? JSON.stringify(cfg.params) : ""}`;
        cache.set(key, { at: Date.now(), data: response.data });
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

