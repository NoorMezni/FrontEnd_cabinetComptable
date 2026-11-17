
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";

import {
    getClients,
    createClient,
    deleteClient,
    updateClient
} from "../api/clientApi";

import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import Notice from "../components/Notice";
import EmptyState from "../components/EmptyState";
import StatusBadge from "../components/StatusBadge";

import "../styles/Clients.css";

const initialForm = {
    nom: "",
    email: "",
    telephone: "",
    motDePasse: "",
    typeClient: "PHYSIQUE",
    identifiantFiscal: "",
    adresse: "",
    comptableId: ""
};

export default function Clients() {
    const { user } = useAuth();
    const isAdmin = user?.role === "ADMIN";

    const [clients, setClients] = useState([]);
    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [editingClient, setEditingClient] = useState(null);
    const [form, setForm] = useState(initialForm);

    const loadClients = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getClients();

            setClients(
                Array.isArray(data)
                    ? data
                    : data?.clients || []
            );
        } catch (err) {
            setError(err.message || "Impossible de charger les clients.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadClients();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const openCreateForm = () => {
        setEditingClient(null);
        setForm(initialForm);
        setShowForm(true);
        setError("");
        setSuccess("");
    };

    const openEditForm = (client) => {
        setEditingClient(client);

        setForm({
            nom: client.nom || "",
            email: client.email || "",
            telephone: client.telephone || "",
            motDePasse: "",
            typeClient: client.typeClient || "PHYSIQUE",
            identifiantFiscal: client.identifiantFiscal || "",
            adresse: client.adresse || "",
            comptableId: client.comptableId ?? ""
        });

        setShowForm(true);
        setError("");
        setSuccess("");
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingClient(null);
        setForm(initialForm);
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setSaving(true);
        setError("");
        setSuccess("");

        const clientData = {
            nom: form.nom.trim(),
            email: form.email.trim(),
            telephone: form.telephone.trim() || null,
            typeClient: form.typeClient,
            identifiantFiscal:
                form.identifiantFiscal.trim() || null,
            adresse: form.adresse.trim() || null,
            comptableId:
                form.comptableId === ""
                    ? null
                    : Number(form.comptableId)
        };

        try {
            if (editingClient) {
                await updateClient(editingClient.id, clientData);
                setSuccess("Client modifié avec succès !");
            } else {
                await createClient({
                    ...clientData,
                    motDePasse: form.motDePasse
                });

                setSuccess("Client ajouté avec succès !");
            }

            setShowForm(false);
            setEditingClient(null);
            setForm(initialForm);

            await loadClients();
        } catch (err) {
            setError(err.message || "Une erreur est survenue.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (client) => {
        const confirmed = window.confirm(
            `Voulez-vous vraiment désactiver ${client.nom} ?`
        );

        if (!confirmed) return;

        setError("");
        setSuccess("");

        try {
            await deleteClient(client.id);

            setSuccess("Client désactivé avec succès !");

            await loadClients();
        } catch (err) {
            setError(err.message || "Impossible de désactiver ce client.");
        }
    };

    const filteredClients = clients.filter((client) => {
        const text = search.toLowerCase();

        return (
            (client.nom || "").toLowerCase().includes(text) ||
            (client.email || "").toLowerCase().includes(text)
        );
    });

    return (
        <div className="clients-page">

            {/* En-tête */}
            <div className="clients-header">
                <div>
                    <h1>Gestion des clients</h1>

                    <p>
                        Gérez les informations des clients du cabinet.
                    </p>
                </div>

                <button
                    type="button"
                    className="clients-primary-button"
                    onClick={openCreateForm}
                >
                    + Ajouter un client
                </button>
            </div>

            {/* Messages */}
            {error && (
                <div className="clients-message">
                    <ErrorMessage
                        message={error}
                        onRetry={loadClients}
                    />
                </div>
            )}

            {success && (
                <div className="clients-message">
                    <Notice
                        type="success"
                        message={success}
                    />
                </div>
            )}

            {/* Formulaire */}
            {showForm && (
                <section className="clients-form-card">
                    <div className="clients-form-header">
                        <h2>
                            {editingClient
                                ? "Modifier le client"
                                : "Nouveau client"}
                        </h2>

                        <button
                            type="button"
                            className="clients-close-button"
                            onClick={closeForm}
                            aria-label="Fermer le formulaire"
                        >
                            ×
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="clients-form-grid">

                            <label className="clients-field">
                                Nom / Raison sociale *
                                <input
                                    name="nom"
                                    value={form.nom}
                                    onChange={handleChange}
                                    required
                                />
                            </label>

                            <label className="clients-field">
                                Email *
                                <input
                                    name="email"
                                    type="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                />
                            </label>

                            {!editingClient && (
                                <label className="clients-field">
                                    Mot de passe *
                                    <input
                                        name="motDePasse"
                                        type="password"
                                        minLength={6}
                                        value={form.motDePasse}
                                        onChange={handleChange}
                                        required
                                    />
                                </label>
                            )}

                            <label className="clients-field">
                                Téléphone
                                <input
                                    name="telephone"
                                    value={form.telephone}
                                    onChange={handleChange}
                                />
                            </label>

                            <label className="clients-field">
                                Type de client *
                                <select
                                    name="typeClient"
                                    value={form.typeClient}
                                    onChange={handleChange}
                                >
                                    <option value="PHYSIQUE">
                                        Personne physique
                                    </option>

                                    <option value="ENTREPRISE">
                                        Entreprise
                                    </option>
                                </select>
                            </label>

                            <label className="clients-field">
                                Identifiant fiscal
                                <input
                                    name="identifiantFiscal"
                                    value={form.identifiantFiscal}
                                    onChange={handleChange}
                                />
                            </label>

                            <label className="clients-field">
                                Adresse
                                <input
                                    name="adresse"
                                    value={form.adresse}
                                    onChange={handleChange}
                                />
                            </label>

                            {isAdmin && (
                                <label className="clients-field">
                                    ID du comptable (facultatif)
                                    <input
                                        name="comptableId"
                                        type="number"
                                        min="1"
                                        value={form.comptableId}
                                        onChange={handleChange}
                                        placeholder="Laisser vide si non affecté"
                                    />
                                </label>
                            )}
                        </div>

                        <div className="clients-form-actions">
                            <button
                                type="submit"
                                className="clients-save-button"
                                disabled={saving}
                            >
                                {saving
                                    ? "Enregistrement..."
                                    : "Enregistrer"}
                            </button>

                            <button
                                type="button"
                                className="clients-cancel-button"
                                onClick={closeForm}
                                disabled={saving}
                            >
                                Annuler
                            </button>
                        </div>
                    </form>
                </section>
            )}

            {/* Liste des clients */}
            <section className="clients-list-card">

                <div className="clients-list-header">
                    <h2>
                        Liste des clients ({filteredClients.length})
                    </h2>

                    <input
                        type="search"
                        className="clients-search"
                        placeholder="Rechercher un client..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {loading ? (
                    <Loading message="Chargement des clients..." />
                ) : filteredClients.length === 0 ? (
                    <EmptyState
                        title={
                            search
                                ? "Aucun résultat"
                                : "Aucun client disponible"
                        }
                        message={
                            search
                                ? "Aucun client ne correspond à votre recherche."
                                : "Les clients apparaîtront ici lorsqu'ils seront disponibles."
                        }
                    />
                ) : (
                    <div className="clients-table-container">
                        <table className="clients-table">
                            <thead>
                                <tr>
                                    <th>Nom</th>
                                    <th>Email</th>
                                    <th>Téléphone</th>
                                    <th>Type</th>
                                    <th>Statut</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredClients.map((client) => (
                                    <tr key={client.id}>
                                        <td className="clients-name">
                                            {client.nom}
                                        </td>

                                        <td>{client.email}</td>

                                        <td>
                                            {client.telephone || "—"}
                                        </td>

                                        <td>
                                            {client.typeClient === "PHYSIQUE"
                                                ? "Personne physique"
                                                : client.typeClient === "ENTREPRISE"
                                                    ? "Entreprise"
                                                    : client.typeClient || "—"}
                                        </td>

                                        <td>
                                            <StatusBadge
                                                status={
                                                    client.actif
                                                        ? "actif"
                                                        : "inactif"
                                                }
                                            />
                                        </td>

                                        <td>
                                            <div className="clients-actions">
                                                {isAdmin && (
                                                    <button
                                                        type="button"
                                                        className="clients-edit-button"
                                                        onClick={() =>
                                                            openEditForm(client)
                                                        }
                                                    >
                                                        Modifier
                                                    </button>
                                                )}

                                                <button
                                                    type="button"
                                                    className="clients-delete-button"
                                                    onClick={() =>
                                                        handleDelete(client)
                                                    }
                                                    disabled={!client.actif}
                                                >
                                                    Désactiver
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}
