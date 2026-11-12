
import { apiRequest } from "./apiClient";

export function getClients() {
    return apiRequest("/clients");
}

export function getClientById(id) {
    return apiRequest(`/clients/${id}`);
}

export function createClient(client) {
    return apiRequest("/clients", {
        method: "POST",
        body: client
    });
}

export function updateClient(id, client) {
    return apiRequest(`/clients/${id}`, {
        method: "PUT",
        body: client
    });
}

export function deleteClient(id) {
    return apiRequest(`/clients/${id}`, {
        method: "DELETE"
    });
}
