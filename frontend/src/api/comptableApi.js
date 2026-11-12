
import { apiRequest } from "./apiClient";

export function getComptables() {
    return apiRequest("/comptables");
}

export function getComptableById(id) {
    return apiRequest(`/comptables/${id}`);
}

export function createComptable(comptable) {
    return apiRequest("/comptables", {
        method: "POST",
        body: comptable
    });
}

export function updateComptable(id, comptable) {
    return apiRequest(`/comptables/${id}`, {
        method: "PUT",
        body: comptable
    });
}

export function deleteComptable(id) {
    return apiRequest(`/comptables/${id}`, {
        method: "DELETE"
    });
}
