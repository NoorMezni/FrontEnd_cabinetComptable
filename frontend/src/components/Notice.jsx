import React from "react";
import {
    CheckCircle,
    AlertTriangle,
    Info,
    XCircle,
} from "lucide-react";
import "../styles/Notice.css";
const NOTICE_CONFIG = {
    success: {
        icon: CheckCircle,
        className: "notice--success",
    },
    warning: {
        icon: AlertTriangle,
        className: "notice--warning",
    },
    info: {
        icon: Info,
        className: "notice--info",
    },
    error: {
        icon: XCircle,
        className: "notice--error",
    },
};

function Notice({
    type = "info",
    message,
    title,
}) {
    const config = NOTICE_CONFIG[type] || NOTICE_CONFIG.info;
    const Icon = config.icon;

    return (
        <div className={`notice ${config.className}`} role="status">
            <Icon size={21} className="notice-icon" />

            <div className="notice-content">
                {title && <strong>{title}</strong>}
                <p>{message}</p>
            </div>
        </div>
    );
}

export default Notice;