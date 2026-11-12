
import { apiRequest } from "./apiClient";

export function getDocuments() {
  return apiRequest("/documents");
}

export function uploadDocument(formData) {
  return apiRequest("/documents", {
    method: "POST",
    body: formData,
  });
}

export function deleteDocument(id) {
  return apiRequest(`/documents/${id}`, {
    method: "DELETE",
  });
}

export async function downloadDocument(id, fileName) {
  const baseUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  const response = await fetch(
    `${baseUrl}/documents/${id}/download`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    let message = "Impossible de télécharger le document.";

    try {
      const data = await response.json();
      message = data.erreur || message;
    } catch {
      // Garder le message par défaut
    }

    throw new Error(message);
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = fileName || `document-${id}`;
  document.body.appendChild(link);
  link.click();
  link.remove();

  window.URL.revokeObjectURL(url);
}
