import React from "react";
import "../styles/Loading.css";
function Loading({ message = "Chargement en cours..." }) {
    return (
        <div className="loading-container" role="status" aria-live="polite">
            <div className="loading-spinner"></div>
            <p>{message}</p>
        </div>
    );
}

export default Loading;
