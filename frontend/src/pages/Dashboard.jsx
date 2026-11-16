import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getStatistiques } from "../api/statistiquesApi";
import { getDashboard } from "../api/dashboardApi";

function formatMontant(valeur) {
    return (
        Number(valeur ?? 0).toLocaleString("fr-FR", {
            minimumFractionDigits: 3,
            maximumFractionDigits: 3
        }) + " DT"
    );
}

// Transforme la reponse du back en liste de cartes selon le role
function construireCartes(role, data) {
    if (role === "ADMIN") {
        return [
            { label: "Administrateurs", value: data.nbAdmins },
            { label: "Comptables", value: data.nbComptables },
            { label: "Clients", value: data.nbClients },
            { label: "Clients sans comptable", value: data.nbClientsSansComptable, alerte: true }
        ];
    }

    const cartes = [];

    if (role === "COMPTABLE") {
        cartes.push({ label: "Mes clients", value: data.nbClients });
    }

    cartes.push(
        { label: "Missions à faire", value: data.nbMissionsAFaire },
        { label: "Missions en cours", value: data.nbMissionsEnCours },
        { label: "Missions en retard", value: data.nbMissionsEnRetard, alerte: true },
        { label: "Factures impayées", value: data.nbFacturesImpayees },
        { label: "Factures en retard", value: data.nbFacturesEnRetard, alerte: true },
        { label: "Montant impayé (TTC)", value: formatMontant(data.montantImpayeTTC) }
    );

    return cartes;
}

export default function Dashboard() {
    const { user } = useAuth();

    const [cartes, setCartes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!user) {
            return;
        }

        // L'admin utilise /statistiques, les autres /dashboard
        const requete = user.role === "ADMIN" ? getStatistiques() : getDashboard();

        requete
            .then((data) => setCartes(construireCartes(user.role, data)))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [user]);

    const titres = {
        ADMIN: "Espace administrateur",
        COMPTABLE: "Espace comptable",
        CLIENT: "Espace client"
    };

    return (
        <div style={{ padding: "40px" }}>
            <h1>Tableau de bord</h1>
            <p>Bienvenue, {user?.nom} ! <strong>{titres[user?.role]}</strong></p>

            <hr style={{ margin: "30px 0" }} />

            {loading && <p>Chargement...</p>}

            {error && <p style={{ color: "red" }}>{error}</p>}

            {!loading && !error && (
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "20px"
                }}>
                    {cartes.map((carte) => {
                        const enAlerte = carte.alerte && Number(carte.value) > 0;

                        return (
                            <div
                                key={carte.label}
                                style={{
                                    background: "white",
                                    padding: "25px",
                                    borderRadius: "12px",
                                    boxShadow: "0 3px 12px rgba(0,0,0,0.06)",
                                    borderLeft: "4px solid " + (enAlerte ? "#bd493d" : "#01B36C")
                                }}
                            >
                                <p style={{ margin: 0, color: "#555" }}>{carte.label}</p>
                                <h2 style={{
                                    fontSize: "28px",
                                    marginTop: "12px",
                                    marginBottom: 0,
                                    color: enAlerte ? "#bd493d" : "#01B36C"
                                }}>
                                    {carte.value}
                                </h2>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}