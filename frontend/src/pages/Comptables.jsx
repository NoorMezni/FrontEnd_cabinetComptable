
import { useEffect, useState } from "react";
import {
    getComptables,
    createComptable,
    updateComptable,
    deleteComptable
} from "../api/comptableApi";

const initialForm = {
    nom: "",
    email: "",
    telephone: "",
    motDePasse: ""
};

export default function Comptables() {
    const [comptables, setComptables] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [editingComptable, setEditingComptable] = useState(null);
    const [form, setForm] = useState(initialForm);

    const loadComptables = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getComptables();

            setComptables(
                Array.isArray(data)
                    ? data
                    : data?.comptables || []
            );
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadComptables();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const openCreateForm = () => {
        setEditingComptable(null);
        setForm(initialForm);
        setShowForm(true);
        setError("");
        setSuccess("");
    };

    const openEditForm = (comptable) => {
        setEditingComptable(comptable);

        setForm({
            nom: comptable.nom || "",
            email: comptable.email || "",
            telephone: comptable.telephone || "",
            motDePasse: ""
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

        const data = {
            nom: form.nom.trim(),
            email: form.email.trim(),
            telephone: form.telephone.trim() || null
        };

        try {
            if (editingComptable) {
                await updateComptable(editingComptable.id, data);
                setSuccess("Comptable modifié avec succès !");
            } else {
                await createComptable({
                    ...data,
                    motDePasse: form.motDePasse
                });
                setSuccess("Comptable ajouté avec succès !");
            }

            setShowForm(false);
            setEditingComptable(null);
            setForm(initialForm);

            await loadComptables();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (comptable) => {
        const confirmed = window.confirm(
            `Voulez-vous vraiment désactiver ${comptable.nom} ?`
        );

        if (!confirmed) return;

        setError("");
        setSuccess("");

        try {
            await deleteComptable(comptable.id);
            setSuccess("Comptable désactivé avec succès !");
            await loadComptables();
        } catch (err) {
            setError(err.message);
        }
    };

    const filteredComptables = comptables.filter((comptable) => {
        const text = search.toLowerCase();

        return (
            (comptable.nom || "").toLowerCase().includes(text) ||
            (comptable.email || "").toLowerCase().includes(text)
        );
    });

    return (
        <div style={{
            padding: "35px",
            background: "#f5f8f6",
            minHeight: "100vh"
        }}>

            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "15px"
            }}>
                <div>
                    <h1 style={{ color: "#012B1D" }}>
                        Gestion des comptables
                    </h1>

                    <p style={{
                        color: "#75847b",
                        marginTop: "8px"
                    }}>
                        Gérez les membres de votre équipe comptable.
                    </p>
                </div>

                <button
                    onClick={openCreateForm}
                    style={primaryButton}
                >
                    + Ajouter un comptable
                </button>
            </div>

            {error && <div style={errorStyle}>{error}</div>}
            {success && <div style={successStyle}>{success}</div>}

            {showForm && (
                <div style={panelStyle}>
                    <h2 style={{
                        color: "#012B1D",
                        marginBottom: "22px"
                    }}>
                        {editingComptable
                            ? "Modifier le comptable"
                            : "Nouveau comptable"}
                    </h2>

                    <form onSubmit={handleSubmit}>
                        <div style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(auto-fit, minmax(230px, 1fr))",
                            gap: "15px"
                        }}>
                            <label style={labelStyle}>
                                Nom complet *
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

                            <label style={labelStyle}>
                                Téléphone
                                <input
                                    style={inputStyle}
                                    name="telephone"
                                    value={form.telephone}
                                    onChange={handleChange}
                                />
                            </label>

                            {!editingComptable && (
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
                        </div>

                        <div style={{
                            display: "flex",
                            gap: "12px",
                            marginTop: "15px"
                        }}>
                            <button
                                type="submit"
                                disabled={saving}
                                style={primaryButton}
                            >
                                {saving
                                    ? "Enregistrement..."
                                    : "Enregistrer"}
                            </button>

                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                style={secondaryButton}
                            >
                                Annuler
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div style={panelStyle}>
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "15px",
                    marginBottom: "20px"
                }}>
                    <h2 style={{ color: "#012B1D" }}>
                        Liste des comptables ({filteredComptables.length})
                    </h2>

                    <input
                        style={{
                            ...inputStyle,
                            width: "270px",
                            maxWidth: "100%",
                            marginTop: 0
                        }}
                        placeholder="Rechercher un comptable..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {loading ? (
                    <p>Chargement des comptables...</p>
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
                                        "Statut",
                                        "Actions"
                                    ].map((heading) => (
                                        <th key={heading} style={tableHeader}>
                                            {heading}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody>
                                {filteredComptables.map((comptable) => (
                                    <tr key={comptable.id}>
                                        <td style={tableCell}>
                                            {comptable.nom}
                                        </td>

                                        <td style={tableCell}>
                                            {comptable.email}
                                        </td>

                                        <td style={tableCell}>
                                            {comptable.telephone || "-"}
                                        </td>

                                        <td style={tableCell}>
                                            <span style={{
                                                background: comptable.actif
                                                    ? "#e5f7ed"
                                                    : "#f0eeee",
                                                color: comptable.actif
                                                    ? "#087c4b"
                                                    : "#777",
                                                padding: "5px 10px",
                                                borderRadius: "20px",
                                                fontSize: "12px"
                                            }}>
                                                {comptable.actif
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
                                                        openEditForm(comptable)
                                                    }
                                                    style={actionButton}
                                                >
                                                    Modifier
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        handleDelete(comptable)
                                                    }
                                                    disabled={!comptable.actif}
                                                    style={{
                                                        ...actionButton,
                                                        background: "#fff0ed",
                                                        color: "#bd493d",
                                                        opacity: comptable.actif
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

                                {filteredComptables.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan="5"
                                            style={{
                                                padding: "25px",
                                                textAlign: "center",
                                                color: "#888"
                                            }}
                                        >
                                            Aucun comptable trouvé.
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

const panelStyle = {
    background: "white",
    padding: "25px",
    borderRadius: "14px",
    marginTop: "25px",
    boxShadow: "0 3px 15px rgba(0,0,0,0.04)"
};

const primaryButton = {
    background: "#012B1D",
    color: "white",
    padding: "12px 20px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600"
};

const secondaryButton = {
    background: "#f0f3f1",
    color: "#012B1D",
    padding: "12px 20px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer"
};

const actionButton = {
    border: "none",
    background: "#fff3e9",
    color: "#a85c35",
    padding: "7px 10px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px"
};

const tableHeader = {
    padding: "14px",
    fontSize: "13px"
};

const tableCell = {
    padding: "15px 14px",
    borderBottom: "1px solid #edf0ee",
    fontSize: "14px",
    color: "#34483d"
};

const errorStyle = {
    background: "#fff0ed",
    color: "#b9382b",
    padding: "13px",
    borderRadius: "8px",
    marginTop: "20px"
};

const successStyle = {
    background: "#e7f7ef",
    color: "#087c4b",
    padding: "13px",
    borderRadius: "8px",
    marginTop: "20px"
};
