import { useEffect, useState } from "react";
import { fetchTeams } from "../services/monitoringApi";
import { handleAxiosError, showWarning } from "@/utils/alerts";

export function useMonitoringTeams(role) {
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const loadTeams = async () => {
      try {
        const res = await fetchTeams();
        const data = res?.data;
        if (typeof data === "string" && data.trim().startsWith("<")) {
          if (!cancelled) {
            showWarning("Gagal mengambil tim", "Respon tidak valid");
            setTeams([]);
          }
          return;
        }
        if (!Array.isArray(data)) {
          if (!cancelled) {
            showWarning("Gagal mengambil tim", "Data tim tidak valid");
            setTeams([]);
          }
          return;
        }
        if (!cancelled) setTeams(data);
      } catch (err) {
        if (!cancelled) handleAxiosError(err, "Gagal mengambil tim");
      }
    };

    loadTeams();
    return () => {
      cancelled = true;
    };
  }, [role]);

  return { teams };
}
