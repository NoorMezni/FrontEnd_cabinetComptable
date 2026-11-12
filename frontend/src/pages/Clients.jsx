
import { useEffect, useState } from "react";
import {
    getClients,
    createClient,
    deleteClient,
    updateClient
} from "../api/clientApi";

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
            setError(err.message);
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
            setError(err.message);
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
            setError(err.message);
        }
    };

    const filteredClients = clients.filter((client) => {
        const text = search.toLowerCase();

        return (
            (client.nom || "").toLowerCase().includes(text) ||
            (client.email || "").toLowerCase().includes(text)
        );
    });

    const inputStyle = {
        width: "100%",
        padding: "11px 13px",
        border: "1px solid #dce5df",
        borderRadius: "8px",
        fontSize: "14px",
        marginTop: "7px"
    };

    const labelStyle = {
        display: "block",
        fontSize: "14px",
        fontWeight: "600",
        color: "#012B1D",
        marginBottom: "16px"
    };

    return (
        <div style={{
            padding: "35px",
            background: "#f5f8f6",
            minHeight: "100vh"
        }}>

            {/* Header */}
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "15px"
            }}>
                <div>
                    <h1 style={{ color: "#012B1D" }}>
                        Gestion des clients
                    </h1>

                    <p style={{
                        color: "#75847b",
                        marginTop: "8px"
                    }}>
                        Gérez les informations des clients du cabinet.
                    </p>
                </div>

                <button
                    onClick={openCreateForm}
                    style={{
                        background: "#012B1D",
                        color: "white",
                        padding: "12px 20px",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: "600"
                    }}
                >
                    + Ajouter un client
                </button>
            </div>

            {/* Messages */}
            {error && (
                <div style={{
                    background: "#fff0ed",
                    color: "#b9382b",
                    padding: "13px",
                    borderRadius: "8px",
                    marginTop: "20px"
                }}>
                    {error}
                </div>
            )}

            {success && (
                <div style={{
                    background: "#e7f7ef",
                    color: "#087c4b",
                    padding: "13px",
                    borderRadius: "8px",
                    marginTop: "20px"
                }}>
                    {success}
                </div>
            )}

            {/* Create / Edit form */}
            {showForm && (
                <div style={{
                    background: "white",
                    padding: "25px",
                    borderRadius: "14px",
                    marginTop: "25px",
                    boxShadow: "0 3px 15px rgba(0,0,0,0.04)"
                }}>
                    <h2 style={{
                        color: "#012B1D",
                        marginBottom: "22px"
                    }}>
                        {editingClient
                            ? "Modifier le client"
                            : "Nouveau client"}
                    </h2>

                    <form onSubmit={handleSubmit}>
                        <div style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(auto-fit, minmax(230px, 1fr))",
                            gap: "15px"
                        }}>

                            <label style={labelStyle}>
                                Nom / Raison sociale *
                                <input
                                    style={inputStyle}
                                    name="nom"
                                    value={form.nom}
                                    onChange={handleChange}
                                    required
                                />
                            </label>

                            <label style={labelStyle}>
                                Email *
                                <input
                                    style={inputStyle}
                                    name="email"
                                    type="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                />
                            </label>

                            {!editingClient && (
                                <label style={labelStyle}>
                                    Mot de passe *
                                    <input
                                        style={inputStyle}
                                        name="motDePasse"
                                        type="password"
                                        minLength={6}
                                        value={form.motDePasse}
                                        onChange={handleChange}
                                        required
                                    />
                                </label>
                            )}

                            <label style={labelStyle}>
                                Téléphone
                                <input
                                    style={inputStyle}
                                    name="telephone"
                                    value={form.telephone}
                                    onChange={handleChange}
                                />
                            </label>

                            <label style={labelStyle}>
                                Type de client *
                                <select
                                    style={inputStyle}
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

                            <label style={labelStyle}>
                                Identifiant fiscal
                                <input
                                    style={inputStyle}
                                    name="identifiantFiscal"
                                    value={form.identifiantFiscal}
                                    onChange={handleChange}
                                />
                            </label>

                            <label style={labelStyle}>
                                Adresse
                                <input
                                    style={inputStyle}
                                    name="adresse"
                                    value={form.adresse}
                                    onChange={handleChange}
                                />
                            </label>

                            <label style={labelStyle}>
                                ID du comptable (facultatif)
                                <input
                                    style={inputStyle}
                                    name="comptableId"
                                    type="number"
                                    min="1"
                                    value={form.comptableId}
                                    onChange={handleChange}
                                    placeholder="Laisser vide si non affecté"
                                />
                            </label>
                        </div>

                        <div style={{
                            display: "flex",
                            gap: "12px",
                            marginTop: "15px"
                        }}>
                            <button
                                type="submit"
                                disabled={saving}
                                style={{
                                    background: "#01B36C",
                                    color: "white",
                                    border: "none",
                                    padding: "12px 22px",
                                    borderRadius: "8px",
                                    cursor: "pointer"
                                }}
                            >
                                {saving
                                    ? "Enregistrement..."
                                    : "Enregistrer"}
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setShowForm(false);
                                    setEditingClient(null);
                                    setError("");
                                }}
                                style={{
                                    background: "#f0f3f1",
                                    color: "#012B1D",
                                    border: "none",
                                    padding: "12px 22px",
                                    borderRadius: "8px",
                                    cursor: "pointer"
                                }}
                            >
                                Annuler
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Search and list */}
            <div style={{
                background: "white",
                padding: "22px",
                borderRadius: "14px",
                marginTop: "25px",
                boxShadow: "0 3px 15px rgba(0,0,0,0.04)"
            }}>
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "15px",
                    marginBottom: "20px"
                }}>
                    <h2 style={{ color: "#012B1D" }}>
                        Liste des clients ({filteredClients.length})
                    </h2>

                    <input
                        type="text"
                        placeholder="Rechercher un client..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{
                            padding: "11px 14px",
                            border: "1px solid #dce5df",
                            borderRadius: "8px",
                            width: "270px",
                            maxWidth: "100%"
                        }}
                    />
                </div>

                {loading ? (
                    <p>Chargement des clients...</p>
                ) : (
                    <div style={{ overflowX: "auto" }}>
                        <table style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            textAlign: "left"
                        }}>
                            <thead>
                                <tr style={{
                                    background: "#f5f8f6",
                                    color: "#456052"
                                }}>
                                    {[
                                        "Nom",
                                        "Email",
                                        "Téléphone",
                                        "Type",
                                        "Statut",
                                        "Actions"
                                    ].map((heading) => (
                                        <th
                                            key={heading}
                                            style={{
                                                padding: "14px",
                                                fontSize: "13px"
                                            }}
                                        >
                                            {heading}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody>
                                {filteredClients.map((client) => (
                                    <tr key={client.id}>
                                        <td style={tableCell}>
                                            {client.nom}
                                        </td>

                                        <td style={tableCell}>
                                            {client.email}
                                        </td>

                                        <td style={tableCell}>
                                            {client.telephone || "-"}
                                        </td>

                                        <td style={tableCell}>
                                            {client.typeClient}
                                        </td>

                                        <td style={tableCell}>
                                            <span style={{
                                                background: client.actif
                                                    ? "#e5f7ed"
                                                    : "#f0eeee",
                                                color: client.actif
                                                    ? "#087c4b"
                                                    : "#777",
                                                padding: "5px 10px",
                                                borderRadius: "20px",
                                                fontSize: "12px"
                                            }}>
                                                {client.actif
                                                    ? "Actif"
                                                    : "Inactif"}
                                            </span>
                                        </td>

                                        <td style={tableCell}>
                                            <div style={{
                                                display: "flex",
                                                gap: "8px"
                                            }}>
                                                <button
                                                    onClick={() =>
                                                        openEditForm(client)
                                                    }
                                                    style={actionButton}
                                                >
                                                    Modifier
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        handleDelete(client)
                                                    }
                                                    disabled={!client.actif}
                                                    style={{
                                                        ...actionButton,
                                                        background: "#fff0ed",
                                                        color: "#bd493d",
                                                        opacity: client.actif
                                                            ? 1
                                                            : 0.4
                                                    }}
                                                >
                                                    Désactiver
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {filteredClients.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan="6"
                                            style={{
                                                padding: "25px",
                                                textAlign: "center",
                                                color: "#888"
                                            }}
                                        >
                                            Aucun client trouvé.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

const tableCell = {
    padding: "15px 14px",
    borderBottom: "1px solid #edf0ee",
    fontSize: "14px",
    color: "#34483d"
};

const actionButton = {
    border: "none",
    background: "#fff3e9",
    color: "#a85c35",
    padding: "7px 10px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
    whiteSpace: "nowrap"
};
