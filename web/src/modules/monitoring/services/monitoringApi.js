import axios from "axios";

export async function fetchTeams() {
  return axios.get("/teams/all");
}

export async function fetchMonitoringLastUpdate() {
  return axios.get("/monitoring/last-update");
}
