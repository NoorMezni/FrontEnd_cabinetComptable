import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    PieChart,
    Pie,
    Cell,
    Legend,
    CartesianGrid
} from "recharts";
import {
    Activity,
    AlertCircle,
    ArrowDownRight,
    ArrowUpRight,
    BriefcaseBusiness,
    Building2,
    CheckCircle2,
    FileText,
    RefreshCw,
    Users,
    UserRoundCog
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { getStatistiques } from "../api/statistiquesApi";
import { getClients, affecterClient } from "../api/clientApi";
import { getComptables } from "../api/comptableApi";
import "../styles/dashboard.css";

const CHART_COLORS = ["#087A50", "#27AE78", "#F2B84B", "#6C8EBF", "#A0AEC0"];

const STATUS_LABELS = {
    A_FAIRE: "À faire",
    EN_COURS: "En cours",
    VALIDEE: "Validée",
    TERMINEE: "Terminée",
    ANNULEE: "Annulée",
    EMISE: "Émise",
    PAYEE: "Payée"
};

function asArray(value, alternateKey) {
    if (Array.isArray(value)) return value;
    if (alternateKey && Array.isArray(value?.[alternateKey])) return value[alternateKey];
    return [];
}

function formatMoney(value) {
    const amount = Number(value ?? 0);
    return `${new Intl.NumberFormat("fr-TN", {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3
    }).format(Number.isFinite(amount) ? amount : 0)} DT`;
}

function StatCard({ icon: Icon, label, value, hint, tone = "green", onClick }) {
    const content = (
        <>
            <div className={`dashboard-stat-icon ${tone}`}><Icon size={20} /></div>
            <div className="dashboard-stat-copy">
                <span className="dashboard-stat-label">{label}</span>
                <strong className="dashboard-stat-value">{value ?? 0}</strong>
                {hint && <span className="dashboard-stat-hint">{hint}</span>}
            </div>
            {onClick && <span className="dashboard-stat-arrow"><ArrowUpRight size={17} /></span>}
        </>
    );

    if (onClick) {
        return <button type="button" className="dashboard-stat-card clickable" onClick={onClick}>{content}</button>;
    }
    return <div className="dashboard-stat-card">{content}</div>;
}

function SectionTitle({ eyebrow, title, description, action }) {
    return (
        <div className="dashboard-section-heading">
            <div>
                {eyebrow && <span className="dashboard-eyebrow">{eyebrow}</span>}
                <h2>{title}</h2>
                {description && <p>{description}</p>}
            </div>
            {action}
        </div>
    );
}

export default function Dashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [stats, setStats] = useState(null);
    const [clients, setClients] = useState([]);
    const [comptables, setComptables] = useState([]);
    const [affectations, setAffectations] = useState({});
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [feedback, setFeedback] = useState({ type: "", text: "" });
    const [assigningId, setAssigningId] = useState(null);

    const chargerDonnees = useCallback(async ({ silent = false } = {}) => {
        if (silent) setRefreshing(true);
        else setLoading(true);
        setError("");

        try {
            const [statistiquesResponse, clientsResponse, comptablesResponse] = await Promise.all([
                getStatistiques(),
                getClients(),
                getComptables()
            ]);

            const statistiques = statistiquesResponse?.statistiques ?? statistiquesResponse;
            const tousLesClients = asArray(clientsResponse, "clients");
            const tousLesComptables = asArray(comptablesResponse, "comptables");

            setStats(statistiques);
            setClients(tousLesClients.filter(client => client.comptableId == null));
            setComptables(tousLesComptables);
            return true;
        } catch (err) {
            setError(err?.message || "Impossible de charger les données du tableau de bord.");
            return false;
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        if (user?.role === "ADMIN") {
            chargerDonnees();
        } else {
            setLoading(false);
        }
    }, [user?.role, chargerDonnees]);

    const handleAffecter = async (clientId) => {
        const comptableId = affectations[clientId];
        if (!comptableId) {
            setFeedback({ type: "error", text: "Choisissez un comptable avant de confirmer." });
            return;
        }

        setAssigningId(clientId);
        setFeedback({ type: "", text: "" });

        try {
            await affecterClient(clientId, comptableId);
            setAffectations(previous => {
                const next = { ...previous };
                delete next[clientId];
                return next;
            });
            const actualisationReussie = await chargerDonnees({ silent: true });
            setFeedback(actualisationReussie
                ? { type: "success", text: "Client affecté. Les statistiques ont été actualisées." }
                : { type: "error", text: "Client affecté, mais le rechargement des statistiques a échoué. Utilisez Actualiser." });
        } catch (err) {
            setFeedback({ type: "error", text: err?.message || "L'affectation du client a échoué." });
        } finally {
            setAssigningId(null);
        }
    };

    const missionsData = useMemo(() => Object.entries(stats?.missionsParStatut ?? {})
        .map(([statut, total]) => ({ statut: STATUS_LABELS[statut] ?? statut, total: Number(total) || 0 })), [stats]);

    const facturesData = useMemo(() => Object.entries(stats?.facturesParStatut ?? {})
        .map(([statut, total]) => ({ statut: STATUS_LABELS[statut] ?? statut, total: Number(total) || 0 })), [stats]);

    if (loading) return <div className="dashboard-page"><div className="dashboard-loading"><span className="dashboard-loader" />Chargement du tableau de bord...</div></div>;

    if (user?.role !== "ADMIN") {
        return (
            <div className="dashboard-page">
                <div className="dashboard-header">
                    <span className="dashboard-eyebrow">ESPACE PERSONNEL</span>
                    <h1>Tableau de bord</h1>
                    <p>Bienvenue, {user?.nom ?? ""}.</p>
                </div>
                <div className="dashboard-empty-state">
                    <Activity size={28} />
                    <h2>Votre tableau de bord</h2>
                    <p>Les indicateurs de votre espace seront affichés ici.</p>
                </div>
            </div>
        );
    }

    if (error && !stats) {
        return <div className="dashboard-page"><div className="dashboard-alert error"><AlertCircle size={17} />{error}</div><button className="dashboard-secondary-button" onClick={() => chargerDonnees()}>Réessayer</button></div>;
    }

    if (!stats) return <div className="dashboard-page"><p>Aucune statistique disponible.</p></div>;

    const chiffreAffaires = stats.chiffreAffairesEncaisse ?? 0;
    const montantImpaye = stats.montantImpaye ?? stats.montantImpayé ?? 0;
    const chargeParComptable = asArray(stats.chargeParComptable, "comptables");

    const statCards = [
        { label: "Administrateurs", value: stats.nbAdmins, icon: UserRoundCog, tone: "blue", path: "/comptables" },
        { label: "Comptables", value: stats.nbComptables, icon: BriefcaseBusiness, tone: "green", path: "/comptables" },
        { label: "Clients", value: stats.nbClients, icon: Users, tone: "violet", path: "/clients" },
        { label: "Clients sans comptable", value: stats.nbClientsSansComptable, icon: AlertCircle, tone: "amber", path: "/clients", alert: Number(stats.nbClientsSansComptable) > 0 },
        { label: "Missions en retard", value: stats.missionsEnRetard, icon: Activity, tone: "red", path: "/missions", alert: Number(stats.missionsEnRetard) > 0 },
        { label: "Factures en retard", value: stats.facturesEnRetard, icon: FileText, tone: "amber", path: "/factures", alert: Number(stats.facturesEnRetard) > 0 }
    ];

    return (
        <div className="dashboard-page">
            <header className="dashboard-header">
                <div>
                    <span className="dashboard-eyebrow">VUE D'ENSEMBLE</span>
                    <h1>Tableau de bord</h1>
                    <p>Bienvenue {user?.nom ?? ""}, voici la situation actuelle du cabinet.</p>
                </div>
                <button className="dashboard-secondary-button" onClick={() => chargerDonnees({ silent: true })} disabled={refreshing}>
                    <RefreshCw size={16} className={refreshing ? "spin" : ""} />
                    {refreshing ? "Actualisation..." : "Actualiser"}
                </button>
            </header>

            {error && <div className="dashboard-alert error"><AlertCircle size={17} />{error}</div>}
            {feedback.text && (
                <div className={`dashboard-alert ${feedback.type}`}>
                    {feedback.type === "success" ? <CheckCircle2 size={17} /> : <AlertCircle size={17} />}
                    {feedback.text}
                    <button type="button" aria-label="Fermer" onClick={() => setFeedback({ type: "", text: "" })}>×</button>
                </div>
            )}

            <section className="dashboard-stats-grid">
                {statCards.map(card => (
                    <StatCard
                        key={card.label}
                        {...card}
                        hint={card.alert ? "Une action peut être nécessaire" : "Voir les détails"}
                        onClick={() => navigate(card.path)}
                    />
                ))}
            </section>

            <section className="dashboard-financial-grid">
                <div className="dashboard-financial-card income">
                    <div className="dashboard-financial-icon"><ArrowUpRight size={21} /></div>
                    <div><span>Chiffre d'affaires encaissé</span><strong>{formatMoney(chiffreAffaires)}</strong><small>Montant total des factures payées</small></div>
                </div>
                <div className="dashboard-financial-card unpaid">
                    <div className="dashboard-financial-icon"><ArrowDownRight size={21} /></div>
                    <div><span>Montant impayé</span><strong>{formatMoney(montantImpaye)}</strong><small>Montant restant à encaisser</small></div>
                </div>
            </section>

            <section className="dashboard-charts-grid">
                <article className="dashboard-panel">
                    <SectionTitle eyebrow="ACTIVITÉ" title="Missions par statut" description="Répartition des missions du cabinet" />
                    {missionsData.length ? (
                        <div className="dashboard-chart">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={missionsData} margin={{ top: 12, right: 12, left: -18, bottom: 8 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDF1EE" />
                                    <XAxis dataKey="statut" tick={{ fill: "#718078", fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <YAxis allowDecimals={false} tick={{ fill: "#718078", fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #E6ECE8" }} />
                                    <Bar dataKey="total" name="Missions" fill="#087A50" radius={[7, 7, 0, 0]} maxBarSize={52} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : <div className="dashboard-chart-empty">Aucune donnée de mission disponible.</div>}
                </article>

                <article className="dashboard-panel">
                    <SectionTitle eyebrow="FACTURATION" title="Factures par statut" description="Répartition des factures enregistrées" />
                    {facturesData.length ? (
                        <div className="dashboard-chart">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={facturesData} dataKey="total" nameKey="statut" cx="50%" cy="46%" innerRadius={58} outerRadius={94} paddingAngle={4}>
                                        {facturesData.map((entry, index) => <Cell key={entry.statut} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #E6ECE8" }} />
                                    <Legend verticalAlign="bottom" height={34} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : <div className="dashboard-chart-empty">Aucune donnée de facture disponible.</div>}
                </article>
            </section>

            <section className="dashboard-panel">
                <SectionTitle eyebrow="ORGANISATION" title="Charge par comptable" description="Suivi des portefeuilles et de l'activité de chaque comptable" />
                {chargeParComptable.length ? (
                    <div className="dashboard-table-wrap">
                        <table className="dashboard-table">
                            <thead><tr><th>Comptable</th><th>Clients</th><th>Missions en cours</th><th>Factures impayées</th></tr></thead>
                            <tbody>
                                {chargeParComptable.map((comptable, index) => (
                                    <tr key={comptable.id ?? `${comptable.nom}-${index}`}>
                                        <td><div className="dashboard-person-cell"><span className="dashboard-avatar">{(comptable.nom ?? "C").trim().charAt(0).toUpperCase()}</span><strong>{comptable.nom ?? "Comptable"}</strong></div></td>
                                        <td>{comptable.nbClients ?? 0}</td>
                                        <td>{comptable.nbMissionsEnCours ?? 0}</td>
                                        <td><span className={`dashboard-count ${Number(comptable.nbFacturesImpayees) > 0 ? "warning" : "normal"}`}>{comptable.nbFacturesImpayees ?? 0}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : <div className="dashboard-chart-empty">Aucun comptable à afficher.</div>}
            </section>

            <section className="dashboard-panel">
                <SectionTitle
                    eyebrow="AFFECTATION"
                    title="Clients sans comptable"
                    description="Affectez les clients en attente à un comptable pour répartir la charge du cabinet."
                    action={<span className="dashboard-pending-badge">{clients.length} en attente</span>}
                />

                {clients.length === 0 ? (
                    <div className="dashboard-success-empty"><CheckCircle2 size={22} /><div><strong>Tous les clients sont affectés</strong><p>Aucun client n'attend actuellement de comptable.</p></div></div>
                ) : (
                    <div className="dashboard-assignment-list">
                        {clients.map(client => (
                            <div className="dashboard-assignment-row" key={client.id}>
                                <div className="dashboard-client-info">
                                    <span className="dashboard-client-icon"><Building2 size={18} /></span>
                                    <div><strong>{client.nom ?? "Client sans nom"}</strong><small>{client.identifiantFiscal || client.email || `Client #${client.id}`}</small></div>
                                </div>
                                <select
                                    className="dashboard-select"
                                    value={affectations[client.id] ?? ""}
                                    onChange={event => setAffectations(previous => ({ ...previous, [client.id]: event.target.value }))}
                                    disabled={assigningId === client.id}
                                    aria-label={`Comptable à affecter à ${client.nom ?? "ce client"}`}
                                >
                                    <option value="">Choisir un comptable</option>
                                    {comptables.map(comptable => <option key={comptable.id} value={comptable.id}>{comptable.nom}</option>)}
                                </select>
                                <button className="dashboard-primary-button" type="button" onClick={() => handleAffecter(client.id)} disabled={assigningId === client.id || !affectations[client.id]}>
                                    {assigningId === client.id ? "Affectation..." : "Affecter"}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
