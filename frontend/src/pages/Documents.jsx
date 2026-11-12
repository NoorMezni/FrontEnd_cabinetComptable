
import { useEffect, useState } from "react";
import {
  getDocuments,
  uploadDocument,
  deleteDocument,
  downloadDocument,
} from "../api/documentApi";
import { getClients } from "../api/clientApi";
import { getMissions } from "../api/missionApi";
import { useAuth } from "../hooks/useAuth";

const initialForm = {
  nom: "",
  typeDocument: "AUTRE",
  clientId: "",
  missionId: "",
  file: null,
};

const documentTypes = [
  "FACTURE_VENTE",
  "FACTURE_ACHAT",
  "RELEVE_BANCAIRE",
  "ACCUSE_DEPOT",
  "CONTRAT",
  "AUTRE",
];

export default function Documents() {
  const { user } = useAuth();
  const role = user?.role;
  const canUpload = ["ADMIN", "COMPTABLE"].includes(role);

  const [documents, setDocuments] = useState([]);
  const [clients, setClients] = useState([]);
  const [missions, setMissions] = useState([]);
  const [form, setForm] = useState(initialForm);
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
      const [docsData, clientsData, missionsData] = await Promise.all([
        getDocuments(),
        canUpload ? getClients() : Promise.resolve([]),
        canUpload ? getMissions() : Promise.resolve([]),
      ]);

      setDocuments(Array.isArray(docsData) ? docsData : []);
      setClients(Array.isArray(clientsData) ? clientsData : []);
      setMissions(Array.isArray(missionsData) ? missionsData : []);
    } catch (err) {
      setError(err.message || "Impossible de charger les documents.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredDocuments = documents.filter((doc) => {
    const value = search.toLowerCase().trim();

    if (!value) return true;

    return [
      doc.nom,
      doc.typeDocument,
      doc.clientId,
      doc.missionId,
    ]
      .join(" ")
      .toLowerCase()
      .includes(value);
  });

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function openForm() {
    setForm(initialForm);
    setError("");
    setSuccess("");
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setForm(initialForm);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.file) {
      setError("Veuillez sélectionner un fichier.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    const formData = new FormData();
    formData.append("file", form.file);
    formData.append("nom", form.nom.trim());
    formData.append("typeDocument", form.typeDocument);
    formData.append("clientId", form.clientId);

    if (form.missionId) {
      formData.append("missionId", form.missionId);
    }

    try {
      await uploadDocument(formData);
      setSuccess("Document ajouté avec succès.");
      closeForm();
      await loadData();
    } catch (err) {
      setError(err.message || "Impossible d'ajouter le document.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDownload(doc) {
    setError("");

    try {
      await downloadDocument(doc.id, doc.nom);
    } catch (err) {
      setError(err.message || "Téléchargement impossible.");
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Voulez-vous vraiment supprimer ce document ?")) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      await deleteDocument(id);
      setSuccess("Document supprimé avec succès.");
      await loadData();
    } catch (err) {
      setError(err.message || "Suppression impossible.");
    }
  }

  const styles = {
    page: { maxWidth: 1200, margin: "0 auto" },
    heading: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 16,
      marginBottom: 24,
    },
    title: { color: "#012B1D", fontSize: 28, margin: 0 },
    subtitle: { color: "#64748B", marginTop: 7 },
    button: {
      background: "#012B1D",
      color: "white",
      border: "none",
      borderRadius: 9,
      padding: "11px 18px",
      cursor: "pointer",
      fontWeight: 600,
    },
    secondary: {
      background: "#E8F3ED",
      color: "#012B1D",
      border: "none",
      borderRadius: 7,
      padding: "8px 12px",
      cursor: "pointer",
      fontWeight: 600,
    },
    danger: {
      background: "#FEE2E2",
      color: "#991B1B",
      border: "none",
      borderRadius: 7,
      padding: "8px 12px",
      cursor: "pointer",
      fontWeight: 600,
    },
    card: {
      background: "white",
      borderRadius: 13,
      padding: 22,
      boxShadow: "0 3px 15px rgba(0,0,0,0.04)",
      marginBottom: 20,
    },
    input: {
      width: "100%",
      padding: 11,
      border: "1px solid #DCE5DF",
      borderRadius: 8,
      boxSizing: "border-box",
      marginTop: 6,
      background: "white",
    },
    label: {
      display: "block",
      color: "#334155",
      fontWeight: 600,
      fontSize: 13,
      marginBottom: 14,
    },
    tableWrapper: { overflowX: "auto" },
    table: { width: "100%", borderCollapse: "collapse", minWidth: 750 },
    th: {
      textAlign: "left",
      padding: 13,
      color: "#64748B",
      fontSize: 12,
      borderBottom: "1px solid #E2E8F0",
      whiteSpace: "nowrap",
    },
    td: {
      padding: 13,
      borderBottom: "1px solid #F1F5F9",
      color: "#334155",
      fontSize: 13,
    },
    alert: {
      padding: 12,
      borderRadius: 8,
      marginBottom: 16,
      background: "#FEE2E2",
      color: "#991B1B",
    },
    success: {
      padding: 12,
      borderRadius: 8,
      marginBottom: 16,
      background: "#DCFCE7",
      color: "#166534",
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.heading}>
        <div>
          <h1 style={styles.title}>Gestion des documents</h1>
          <p style={styles.subtitle}>
            Consultez, ajoutez et téléchargez les documents du cabinet.
          </p>
        </div>

        {canUpload && (
          <button style={styles.button} onClick={openForm}>
            + Ajouter un document
          </button>
        )}
      </div>

      {error && <div style={styles.alert}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}

      {showForm && canUpload && (
        <div style={styles.card}>
          <h2 style={{ color: "#012B1D", marginTop: 0 }}>
            Ajouter un document
          </h2>

          <form onSubmit={handleSubmit}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 12,
              }}
            >
              <label style={styles.label}>
                Nom du document *
                <input
                  style={styles.input}
                  name="nom"
                  value={form.nom}
                  onChange={handleChange}
                  required
                  maxLength={255}
                  placeholder="Ex : Facture janvier"
                />
              </label>

              <label style={styles.label}>
                Type de document *
                <select
                  style={styles.input}
                  name="typeDocument"
                  value={form.typeDocument}
                  onChange={handleChange}
                  required
                >
                  {documentTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
              </label>

              <label style={styles.label}>
                Client *
                <select
                  style={styles.input}
                  name="clientId"
                  value={form.clientId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Choisir un client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.nom}
                    </option>
                  ))}
                </select>
              </label>

              <label style={styles.label}>
                Mission (facultatif)
                <select
                  style={styles.input}
                  name="missionId"
                  value={form.missionId}
                  onChange={handleChange}
                >
                  <option value="">Aucune mission</option>
                  {missions
                    .filter(
                      (mission) =>
                        !form.clientId ||
                        String(mission.clientId) === String(form.clientId)
                    )
                    .map((mission) => (
                      <option key={mission.id} value={mission.id}>
                        Mission #{mission.id} - {mission.typeMission}
                      </option>
                    ))}
                </select>
              </label>

              <label style={styles.label}>
                Fichier *
                <input
                  style={styles.input}
                  type="file"
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      file: event.target.files?.[0] || null,
                    }))
                  }
                  required
                />
              </label>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button type="submit" style={styles.button} disabled={saving}>
                {saving ? "Envoi en cours..." : "Enregistrer"}
              </button>

              <button
                type="button"
                style={styles.secondary}
                onClick={closeForm}
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={styles.card}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
            marginBottom: 20,
          }}
        >
          <h2 style={{ color: "#012B1D", margin: 0 }}>Liste des documents</h2>

          <input
            style={{ ...styles.input, width: 280, marginTop: 0 }}
            placeholder="Rechercher un document..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        {loading ? (
          <p>Chargement des documents...</p>
        ) : filteredDocuments.length === 0 ? (
          <p style={{ color: "#64748B" }}>Aucun document trouvé.</p>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Nom</th>
                  <th style={styles.th}>Type</th>
                  <th style={styles.th}>Client</th>
                  <th style={styles.th}>Mission</th>
                  <th style={styles.th}>Date d'ajout</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredDocuments.map((doc) => {
                  const client = clients.find(
                    (item) => item.id === doc.clientId
                  );

                  return (
                    <tr key={doc.id}>
                      <td style={styles.td}>
                        <strong>{doc.nom}</strong>
                      </td>

                      <td style={styles.td}>
                        {doc.typeDocument?.replaceAll("_", " ")}
                      </td>

                      <td style={styles.td}>
                        {client?.nom || `Client #${doc.clientId}`}
                      </td>

                      <td style={styles.td}>
                        {doc.missionId ? `Mission #${doc.missionId}` : "—"}
                      </td>

                      <td style={styles.td}>{doc.dateAjout || "—"}</td>

                      <td style={styles.td}>
                        <div style={{ display: "flex", gap: 7 }}>
                          <button
                            style={styles.secondary}
                            onClick={() => handleDownload(doc)}
                          >
                            Télécharger
                          </button>

                          {canUpload && (
                            <button
                              style={styles.danger}
                              onClick={() => handleDelete(doc.id)}
                            >
                              Supprimer
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}