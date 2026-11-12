
import { apiRequest } from "./apiClient";

export function loginApi(email, motDePasse) {
    return apiRequest("/auth/login", {
        method: "POST",
        auth: false,
        body: {
            email,
            motDePasse
        }
    });
}

export function logoutApi() {
    return apiRequest("/auth/logout", {
        method: "POST"
    });
}
