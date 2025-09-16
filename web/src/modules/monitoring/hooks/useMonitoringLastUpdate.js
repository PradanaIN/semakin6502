import { useEffect, useState } from "react";
import { fetchMonitoringLastUpdate } from "../services/monitoringApi";

const POLL_INTERVAL = 60000;

export function useMonitoringLastUpdate() {
  const [lastUpdate, setLastUpdate] = useState("");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetchMonitoringLastUpdate();
        if (cancelled) return;
        if (res?.data?.fetchedAt) {
          setLastUpdate(res.data.fetchedAt);
        } else if (res?.headers?.date) {
          setLastUpdate(new Date(res.headers.date).toISOString());
        } else if (res?.data?.lastUpdate) {
          setLastUpdate(res.data.lastUpdate);
        } else {
          setLastUpdate(new Date().toISOString());
        }
      } catch {
        if (!cancelled) {
          setLastUpdate((prev) => prev || "");
        }
      }
    };

    load();
    const id = setInterval(load, POLL_INTERVAL);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return lastUpdate;
}
