
import { apiRequest } from "./apiClient";

export function updateProfile(profile) {
  return apiRequest("/profile", {
    method: "PUT",
    body: profile,
  });
}
