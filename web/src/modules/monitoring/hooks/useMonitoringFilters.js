import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getCurrentWeekIndex, getWeekStarts } from "../utils/date";

const TABS = ["harian", "mingguan", "bulanan"];

export function useMonitoringFilters() {
  const location = useLocation();
  const navigate = useNavigate();
  const initFromQuery = useRef(false);
  const requestedWeekIndex = useRef(null);

  const today = useMemo(() => new Date(), []);

  const [tab, setTab] = useState("harian");
  const [monthIndex, setMonthIndex] = useState(today.getMonth());
  const [weekIndex, setWeekIndex] = useState(0);
  const [weekStarts, setWeekStarts] = useState([]);
  const [year, setYear] = useState(today.getFullYear());
  const [teamId, setTeamId] = useState("");
  const [monthlyMode, setMonthlyMode] = useState("current");

  useEffect(() => {
    if (initFromQuery.current) return;
    const params = new URLSearchParams(location.search);
    const qTab = params.get("tab");
    const qMonth = parseInt(params.get("month"), 10);
    const qYear = parseInt(params.get("year"), 10);
    const qWeek = parseInt(params.get("week"), 10);
    const qTeam = params.get("team");
    const qMode = params.get("monthlyMode");

    if (TABS.includes(qTab)) setTab(qTab);
    if (!Number.isNaN(qYear)) setYear(qYear);
    if (!Number.isNaN(qMonth) && qMonth >= 1 && qMonth <= 12) {
      setMonthIndex(qMonth - 1);
    }
    if (!Number.isNaN(qWeek)) {
      requestedWeekIndex.current = qWeek - 1;
    }
    if (qTeam) setTeamId(qTeam);
    if (qMode === "year" || qMode === "current") setMonthlyMode(qMode);

    initFromQuery.current = true;
  }, [location.search]);

  useEffect(() => {
    const starts = getWeekStarts(monthIndex, year);
    setWeekStarts(starts);

    if (tab !== "mingguan") {
      setWeekIndex((prev) => Math.min(prev, Math.max(starts.length - 1, 0)));
      return;
    }

    if (requestedWeekIndex.current != null) {
      const idx = requestedWeekIndex.current;
      requestedWeekIndex.current = null;
      if (idx >= 0 && idx < starts.length) {
        setWeekIndex(idx);
        return;
      }
    }

    const isCurrentMonth =
      monthIndex === today.getMonth() && year === today.getFullYear();
    if (isCurrentMonth) {
      const currentIdx = getCurrentWeekIndex(starts);
      if (currentIdx !== -1) {
        setWeekIndex(currentIdx);
        return;
      }
    }
    setWeekIndex(0);
  }, [monthIndex, year, tab, today]);

  useEffect(() => {
    if (!initFromQuery.current) return;
    const params = new URLSearchParams();
    params.set("tab", tab);
    params.set("month", String(monthIndex + 1));
    params.set("year", String(year));
    if (tab === "mingguan") {
      params.set("week", String(weekIndex + 1));
    }
    if (teamId) params.set("team", teamId);
    if (monthlyMode !== "current") params.set("monthlyMode", monthlyMode);

    navigate({ pathname: location.pathname, search: `?${params.toString()}` }, {
      replace: true,
    });
  }, [tab, monthIndex, weekIndex, year, teamId, monthlyMode, navigate, location.pathname]);

  return {
    tab,
    setTab,
    monthIndex,
    setMonthIndex,
    weekIndex,
    setWeekIndex,
    weekStarts,
    year,
    setYear,
    teamId,
    setTeamId,
    monthlyMode,
    setMonthlyMode,
  };
}
