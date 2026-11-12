
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getStatistiques } from "../api/statistiquesApi";

export default function Dashboard() {
    const { user, logout } = useAuth();

    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (user?.role !== "ADMIN") {
            setLoading(false);
            return;
        }

        getStatistiques()
            .then(setStats)
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [user]);

    const cards = [
        { label: "Administrateurs", value: stats?.nbAdmins },
        { label: "Comptables", value: stats?.nbComptables },
        { label: "Clients", value: stats?.nbClients },
        {
            label: "Clients sans comptable",
            value: stats?.nbClientsSansComptable
        }
    ];

    return (
        <div style={{ padding: "40px" }}>
            <h1>Tableau de bord</h1>

            <p>Bienvenue, {user?.nom} !</p>
            <p>Rôle : {user?.role}</p>

            <button onClick={logout}>Déconnexion</button>

            <hr style={{ margin: "30px 0" }} />

            {user?.role === "ADMIN" && (
                <>
                    <h2>Statistiques générales</h2>

                    {loading && <p>Chargement...</p>}

                    {error && <p style={{ color: "red" }}>{error}</p>}

                    {stats && (
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                            gap: "20px",
                            marginTop: "20px"
                        }}>
                            {cards.map((card) => (
                                <div
                                    key={card.label}
                                    style={{
                                        background: "white",
                                        padding: "25px",
                                        borderRadius: "12px",
                                        boxShadow: "0 3px 12px rgba(0,0,0,0.06)"
                                    }}
                                >
                                    <p>{card.label}</p>
                                    <h2 style={{
                                        fontSize: "30px",
                                        marginTop: "12px",
                                        color: "#01B36C"
                                    }}>
                                        {card.value}
                                    </h2>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {user?.role === "COMPTABLE" && (
                <h2>Espace Comptable</h2>
            )}

            {user?.role === "CLIENT" && (
                <h2>Espace Client</h2>
            )}
        </div>
    );
}
