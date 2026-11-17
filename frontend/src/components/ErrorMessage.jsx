
import React from "react";
import { AlertCircle } from "lucide-react";
import "../styles/ErrorMessage.css";
function ErrorMessage({
    message = "Une erreur est survenue.",
    onRetry,
}) {
    return (
        <div className="error-message" role="alert">
            <AlertCircle size={22} className="error-message-icon" />

            <div className="error-message-content">
                <p>{message}</p>

                {onRetry && (
                    <button
                        type="button"
                        className="error-retry-button"
                        onClick={onRetry}
                    >
                        Réessayer
                    </button>
                )}
            </div>
        </div>
    );
}

export default ErrorMessage;
