import React from "react";
import { Inbox } from "lucide-react";
import "../styles/EmptyState.css";
function EmptyState({
    title = "Aucune donnée disponible",
    message = "Les éléments apparaîtront ici lorsqu'ils seront disponibles.",
    actionLabel,
    onAction,
}) {
    return (
        <div className="empty-state">
            <div className="empty-state-icon">
                <Inbox size={32} />
            </div>

            <h3>{title}</h3>
            <p>{message}</p>

            {actionLabel && onAction && (
                <button type="button" onClick={onAction}>
                    {actionLabel}
                </button>
            )}
        </div>
    );
}

export default EmptyState;