
import { apiRequest } from "./apiClient";

export function getFactures() {
  return apiRequest("/factures");
}

// Route réservée au client connecté
export function getMyFactures() {
  return apiRequest("/me/factures");
}

export function getFactureById(id) {
  return apiRequest(`/factures/${id}`);
}

export function getFacturesByClient(id) {
  return apiRequest(`/clients/${id}/factures`);
}

export function createFacture(facture) {
  return apiRequest("/factures", {
    method: "POST",
    body: facture,
  });
}

export function updateFacture(id, facture) {
  return apiRequest(`/factures/${id}`, {
    method: "PUT",
    body: facture,
  });
}

export function payerFacture(id) {
  return apiRequest(`/factures/${id}/payer`, {
    method: "POST",
  });
}

export function annulerFacture(id) {
  return apiRequest(`/factures/${id}/annuler`, {
    method: "POST",
  });
}
