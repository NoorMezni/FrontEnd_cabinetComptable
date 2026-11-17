
import { useEffect, useMemo, useState } from "react";

import {
    getFactures,
    getMyFactures,
    createFacture,
    updateFacture,
    payerFacture,
    annulerFacture,
} from "../api/factureApi";

import { getClients } from "../api/clientApi";
import { useAuth } from "../hooks/useAuth";

import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import Notice from "../components/Notice";
import EmptyState from "../components/EmptyState";
import StatusBadge from "../components/StatusBadge";

import formatMoney from "../utils/formatMoney";

import "../styles/Factures.css";

const initialForm = {
    numero: "",
    description: "",
    dateEmission: "",
    dateEcheance: "",
    montantHT: "",
    tauxTVA: 19,
    clientId: "",
};

export default function Factures() {
    const { user } = useAuth();
    const role = user?.role;

    const canManage = role === "ADMIN" || role === "COMPTABLE";

    const [factures, setFactures] = useState([]);
    const [clients, setClients] = useState([]);
    const [form, setForm] = useState(initialForm);

    const [editingId, setEditingId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    async function loadData() {
        setLoading(true);
        setError("");

        try {
            const facturesPromise = canManage
                ? getFactures()
                : getMyFactures();

            const clientsPromise = canManage
                ? getClients()
                : Promise.resolve([]);

            const [facturesData, clientsData] = await Promise.all([
                facturesPromise,
                clientsPromise,
            ]);

            setFactures(
                Array.isArray(facturesData) ? facturesData : []
            );

            setClients(
                Array.isArray(clientsData) ? clientsData : []
            );
        } catch (err) {
            setError(
                err.message || "Impossible de charger les factures."
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (role) {
            loadData();
        }
    }, [role]);

    const filteredFactures = useMemo(() => {
        const value = search.toLowerCase().trim();

        if (!value) return factures;

        return factures.filter((facture) =>
            [
                facture.numero,
                facture.description,
                facture.statut,
                facture.clientId,
            ]
                .join(" ")
                .toLowerCase()
                .includes(value)
        );
    }, [factures, search]);

    function handleChange(event) {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    }

    function openCreateForm() {
        setEditingId(null);
        setForm(initialForm);
        setError("");
        setSuccess("");
        setShowForm(true);
    }

    function openEditForm(facture) {
        setEditingId(facture.id);

        setForm({
            numero: facture.numero || "",
            description: facture.description || "",
            dateEmission: facture.dateEmission || "",
            dateEcheance: facture.dateEcheance || "",
            montantHT: facture.montantHT ?? "",
            tauxTVA: facture.tauxTVA ?? 19,
            clientId: facture.clientId ?? "",
        });

        setError("");
        setSuccess("");
        setShowForm(true);
    }

    function closeForm() {
        setShowForm(false);
        setEditingId(null);
        setForm(initialForm);
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (!canManage) return;

        setSaving(true);
        setError("");
        setSuccess("");

        const data = {
            numero: form.numero.trim(),
            description: form.description.trim(),
            dateEmission: form.dateEmission,
            dateEcheance: form.dateEcheance,
            montantHT: Number(form.montantHT),
            tauxTVA: Number(form.tauxTVA),
            clientId: Number(form.clientId),
        };

        try {
            if (editingId !== null) {
                await updateFacture(editingId, data);
                setSuccess("Facture modifiée avec succès.");
            } else {
                await createFacture(data);
                setSuccess("Facture créée avec succès.");
            }

            closeForm();
            await loadData();
        } catch (err) {
            setError(err.message || "Une erreur est survenue.");
        } finally {
            setSaving(false);
        }
    }

    async function handlePayment(id) {
        if (!canManage) return;

        if (!window.confirm("Confirmer le paiement de cette facture ?")) {
            return;
        }

        setError("");
        setSuccess("");

        try {
            await payerFacture(id);
            setSuccess("Facture marquée comme payée.");
            await loadData();
        } catch (err) {
            setError(
                err.message || "Impossible de payer cette facture."
            );
        }
    }

    async function handleCancel(id) {
        if (!canManage) return;

        if (!window.confirm("Voulez-vous vraiment annuler cette facture ?")) {
            return;
        }

        setError("");
        setSuccess("");

        try {
            await annulerFacture(id);
            setSuccess("Facture annulée.");
            await loadData();
        } catch (err) {
            setError(
                err.message || "Impossible d'annuler cette facture."
            );
        }
    }

    function getStatusLabel(statut) {
        switch (statut) {
            case "PAYEE":
                return "payé";
            case "ANNULEE":
                return "annulé";
            case "EMISE":
                return "émise";
            default:
                return statut || "Inconnu";
        }
    }

    return (
        <div className="factures-page">

            {/* En-tête */}
            <header className="factures-header">
                <div>
                    <h1>
                        {canManage
                            ? "Gestion des factures"
                            : "Mes factures"}
                    </h1>

                    <p>
                        {canManage
                            ? "Consultez et gérez les factures du cabinet."
                            : "Consultez vos factures et leur état de paiement."}
                    </p>
                </div>

                {canManage && (
                    <button
                        type="button"
                        className="factures-primary-button"
                        onClick={openCreateForm}
                    >
                        + Nouvelle facture
                    </button>
                )}
            </header>

            {/* Messages */}
            {error && (
                <div className="factures-message">
                    <ErrorMessage
                        message={error}
                        onRetry={loadData}
                    />
                </div>
            )}

            {success && (
                <div className="factures-message">
                    <Notice
                        type="success"
                        message={success}
                    />
                </div>
            )}

            {/* Formulaire */}
            {showForm && canManage && (
                <section className="factures-form-card">
                    <div className="factures-form-header">
                        <h2>
                            {editingId !== null
                                ? "Modifier la facture"
                                : "Créer une facture"}
                        </h2>

                        <button
                            type="button"
                            className="factures-close-button"
                            onClick={closeForm}
                            aria-label="Fermer le formulaire"
                        >
                            ×
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="factures-form-grid">

                            <label className="factures-field">
                                Numéro de facture *
                                <input
                                    name="numero"
                                    value={form.numero}
                                    onChange={handleChange}
                                    required
                                    maxLength={30}
                                />
                            </label>

                            <label className="factures-field">
                                Client *
                                <select
                                    name="clientId"
                                    value={form.clientId}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">
                                        Choisir un client
                                    </option>

                                    {clients.map((client) => (
                                        <option
                                            key={client.id}
                                            value={client.id}
                                        >
                                            {client.nom}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label className="factures-field">
                                Date d'émission *
                                <input
                                    type="date"
                                    name="dateEmission"
                                    value={form.dateEmission}
                                    onChange={handleChange}
                                    required
                                />
                            </label>

                            <label className="factures-field">
                                Date d'échéance *
                                <input
                                    type="date"
                                    name="dateEcheance"
                                    value={form.dateEcheance}
                                    onChange={handleChange}
                                    min={form.dateEmission || undefined}
                                    required
                                />
                            </label>

                            <label className="factures-field">
                                Montant HT (TND) *
                                <input
                                    type="number"
                                    name="montantHT"
                                    value={form.montantHT}
                                    onChange={handleChange}
                                    min="0"
                                    step="0.01"
                                    required
                                />
                            </label>

                            <label className="factures-field">
                                Taux TVA (%) *
                                <input
                                    type="number"
                                    name="tauxTVA"
                                    value={form.tauxTVA}
                                    onChange={handleChange}
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    required
                                />
                            </label>
                        </div>

                        <label className="factures-field factures-description">
                            Description *
                            <textarea
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                maxLength={255}
                                required
                            />
                        </label>

                        <div className="factures-form-actions">
                            <button
                                type="submit"
                                className="factures-save-button"
                                disabled={saving}
                            >
                                {saving
                                    ? "Enregistrement..."
                                    : "Enregistrer"}
                            </button>

                            <button
                                type="button"
                                className="factures-cancel-button"
                                onClick={closeForm}
                                disabled={saving}
                            >
                                Annuler
                            </button>
                        </div>
                    </form>
                </section>
            )}

            {/* Liste des factures */}
            <section className="factures-list-card">
                <div className="factures-list-header">
                    <div>
                        <h2>
                            {canManage
                                ? "Liste des factures"
                                : "Mes factures"}
                        </h2>

                        <span className="factures-count">
                            {filteredFactures.length} facture(s)
                        </span>
                    </div>

                    <input
                        type="search"
                        className="factures-search"
                        placeholder="Rechercher une facture..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />
                </div>

                {loading ? (
                    <Loading message="Chargement des factures..." />
                ) : filteredFactures.length === 0 ? (
                    <EmptyState
                        title={
                            search
                                ? "Aucun résultat"
                                : "Aucune facture disponible"
                        }
                        message={
                            search
                                ? "Aucune facture ne correspond à votre recherche."
                                : "Les factures apparaîtront ici lorsqu'elles seront disponibles."
                        }
                    />
                ) : (
                    <div className="factures-table-container">
                        <table className="factures-table">
                            <thead>
                                <tr>
                                    <th>Numéro</th>
                                    <th>Description</th>

                                    {canManage && <th>Client</th>}

                                    <th>Émission</th>
                                    <th>Échéance</th>
                                    <th>Montant TTC</th>
                                    <th>Statut</th>

                                    {canManage && <th>Actions</th>}
                                </tr>
                            </thead>

                            <tbody>
                                {filteredFactures.map((facture) => {
                                    const client = clients.find(
                                        (item) =>
                                            item.id === facture.clientId
                                    );

                                    return (
                                        <tr key={facture.id}>
                                            <td className="factures-number">
                                                {facture.numero}
                                            </td>

                                            <td className="factures-description-cell">
                                                {facture.description}
                                            </td>

                                            {canManage && (
                                                <td>
                                                    {client?.nom ||
                                                        `Client #${facture.clientId}`}
                                                </td>
                                            )}

                                            <td>{facture.dateEmission}</td>

                                            <td>
                                                {facture.dateEcheance}

                                                {facture.enRetard &&
                                                    facture.statut === "EMISE" && (
                                                        <span className="factures-late">
                                                            En retard
                                                        </span>
                                                    )}
                                            </td>

                                            <td className="factures-amount">
                                                {formatMoney(facture.montantTTC)}
                                            </td>

                                            <td>
                                                <StatusBadge
                                                    status={getStatusLabel(
                                                        facture.statut
                                                    )}
                                                />
                                            </td>

                                            {canManage && (
                                                <td>
                                                    <div className="factures-actions">
                                                        {facture.statut === "EMISE" && (
                                                            <>
                                                                <button
                                                                    type="button"
                                                                    className="factures-edit-button"
                                                                    onClick={() =>
                                                                        openEditForm(facture)
                                                                    }
                                                                >
                                                                    Modifier
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    className="factures-pay-button"
                                                                    onClick={() =>
                                                                        handlePayment(facture.id)
                                                                    }
                                                                >
                                                                    Payer
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    className="factures-cancel-button"
                                                                    onClick={() =>
                                                                        handleCancel(facture.id)
                                                                    }
                                                                >
                                                                    Annuler
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}
