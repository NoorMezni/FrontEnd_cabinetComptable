
import { apiRequest } from "./apiClient";

export function getMissions() {
  return apiRequest("/missions");
}

export function getMissionById(id) {
  return apiRequest(`/missions/${id}`);
}

export function getMissionsByClient(id) {
  return apiRequest(`/clients/${id}/missions`);
}

export function getMyMissions() {
  return apiRequest("/me/missions");
}

export function createMission(mission) {
  return apiRequest("/missions", {
    method: "POST",
    body: mission,
  });
}

export function updateMission(id, mission) {
  return apiRequest(`/missions/${id}`, {
    method: "PUT",
    body: mission,
  });
}

export function demarrerMission(id) {
  return apiRequest(`/missions/${id}/demarrer`, {
    method: "POST",
  });
}

export function validerMission(id) {
  return apiRequest(`/missions/${id}/valider`, {
    method: "POST",
  });
}

export function terminerMission(id) {
  return apiRequest(`/missions/${id}/terminer`, {
    method: "POST",
  });
}

export function annulerMission(id) {
  return apiRequest(`/missions/${id}/annuler`, {
    method: "POST",
  });
}

export function deposerMission(id) {
  return apiRequest(`/missions/${id}/deposer`, {
    method: "POST",
  });
}
