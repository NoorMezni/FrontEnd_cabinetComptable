
const API_URL = import.meta.env.VITE_API_URL;

export async function apiRequest(path, options = {}) {
    const {
        method = "GET",
        body,
        auth = true
    } = options;

    const headers = {};

    // Add JWT token for protected routes
    const token = localStorage.getItem("token");

    if (auth && token) {
        headers.Authorization = `Bearer ${token}`;
    }

    // Handle JSON and file uploads
    if (body && !(body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
    }

    const response = await fetch(`${API_URL}${path}`, {
        method,
        headers,
        body: body instanceof FormData
            ? body
            : body ? JSON.stringify(body) : undefined
    });

    // No content response
    if (response.status === 204) {
        return null;
    }

    const text = await response.text();

    let data = null;

    if (text) {
        try {
            data = JSON.parse(text);
        } catch {
            data = text;
        }
    }

    // Handle errors
    if (!response.ok) {
        if (response.status === 401 && auth) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/login";
        }

        const message =
            data?.erreur ||
            data?.message ||
            "Une erreur est survenue";

        throw new Error(message);
    }

    return data;
}
