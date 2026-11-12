
import { apiRequest } from "./apiClient";

export function getStatistiques() {
    return apiRequest("/statistiques");
}
