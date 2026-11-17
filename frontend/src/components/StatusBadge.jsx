import React from "react";
import "../styles/StatusBadge.css";
const STATUS_CONFIG = {
    a_faire: { label: "À faire", variant: "warning" },
    validee: { label: "Validée", variant: "success" },
    terminee: { label: "Terminée", variant: "success" },
    annulee: { label: "Annulée", variant: "danger" },

    payé: { label: "Payé", variant: "success" },
    paye: { label: "Payé", variant: "success" },
    paid: { label: "Payé", variant: "success" },

    impayé: { label: "Impayé", variant: "danger" },
    impaye: { label: "Impayé", variant: "danger" },
    unpaid: { label: "Impayé", variant: "danger" },

    "en attente": { label: "En attente", variant: "warning" },
    pending: { label: "En attente", variant: "warning" },

    validé: { label: "Validé", variant: "success" },
    valide: { label: "Validé", variant: "success" },
    completed: { label: "Terminé", variant: "success" },
    terminé: { label: "Terminé", variant: "success" },
    termine: { label: "Terminé", variant: "success" },

    "en cours": { label: "En cours", variant: "info" },
    en_cours: { label: "En cours", variant: "info" },
    in_progress: { label: "En cours", variant: "info" },

    annulé: { label: "Annulé", variant: "danger" },
    annule: { label: "Annulé", variant: "danger" },
    cancelled: { label: "Annulé", variant: "danger" },

    brouillon: { label: "Brouillon", variant: "default" },
    draft: { label: "Brouillon", variant: "default" },

    actif: { label: "Actif", variant: "success" },
    inactif: { label: "Inactif", variant: "danger" },
};

function StatusBadge({ status }) {
    const normalizedStatus = String(status ?? "").trim().toLowerCase();

    const config = STATUS_CONFIG[normalizedStatus] || {
        label: status || "Inconnu",
        variant: "default",
    };

    return (
        <span className={`status-badge status-badge--${config.variant}`}>
            {config.label}
        </span>
    );
}

export default StatusBadge;