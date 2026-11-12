
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
      // ADMIN et COMPTABLE : toutes les factures
      // CLIENT : uniquement ses propres factures
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
      setError(err.message || "Impossible de charger les factures.");
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
      if (editingId) {
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
      setError(err.message || "Impossible de payer cette facture.");
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
      setError(err.message || "Impossible d'annuler cette facture.");
    }
  }

  function formatMoney(value) {
    return `${Number(value || 0).toFixed(2)} TND`;
  }

  function statusStyle(statut) {
    if (statut === "PAYEE") {
      return { background: "#DCFCE7", color: "#166534" };
    }

    if (statut === "ANNULEE") {
      return { background: "#FEE2E2", color: "#991B1B" };
    }

    return { background: "#FEF3C7", color: "#92400E" };
  }

  const styles = {
    page: {
      maxWidth: 1200,
      margin: "0 auto",
    },
    heading: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 16,
      marginBottom: 24,
    },
    title: {
      color: "#012B1D",
      fontSize: 28,
      margin: 0,
    },
    subtitle: {
      color: "#64748B",
      marginTop: 7,
    },
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
    },
    label: {
      display: "block",
      color: "#334155",
      fontWeight: 600,
      fontSize: 13,
      marginBottom: 14,
    },
    tableWrapper: {
      overflowX: "auto",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      minWidth: 850,
    },
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
          <h1 style={styles.title}>
            {canManage ? "Gestion des factures" : "Mes factures"}
          </h1>

          <p style={styles.subtitle}>
            {canManage
              ? "Consultez et gérez les factures du cabinet."
              : "Consultez vos factures et leur état de paiement."}
          </p>
        </div>

        {canManage && (
          <button style={styles.button} onClick={openCreateForm}>
            + Nouvelle facture
          </button>
        )}
      </div>

      {error && <div style={styles.alert}>{error}</div>}
      {success && <div style={styles.success}>{success}</div>}

      {showForm && canManage && (
        <div style={styles.card}>
          <h2 style={{ color: "#012B1D", marginTop: 0 }}>
            {editingId ? "Modifier la facture" : "Créer une facture"}
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
                Numéro de facture *
                <input
                  style={styles.input}
                  name="numero"
                  value={form.numero}
                  onChange={handleChange}
                  required
                  maxLength={30}
                />
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
                Date d'émission *
                <input
                  style={styles.input}
                  type="date"
                  name="dateEmission"
                  value={form.dateEmission}
                  onChange={handleChange}
                  required
                />
              </label>

              <label style={styles.label}>
                Date d'échéance *
                <input
                  style={styles.input}
                  type="date"
                  name="dateEcheance"
                  value={form.dateEcheance}
                  onChange={handleChange}
                  min={form.dateEmission || undefined}
                  required
                />
              </label>

              <label style={styles.label}>
                Montant HT (TND) *
                <input
                  style={styles.input}
                  type="number"
                  name="montantHT"
                  value={form.montantHT}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                />
              </label>

              <label style={styles.label}>
                Taux TVA (%) *
                <input
                  style={styles.input}
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

            <label style={styles.label}>
              Description *
              <textarea
                style={{
                  ...styles.input,
                  minHeight: 80,
                  resize: "vertical",
                }}
                name="description"
                value={form.description}
                onChange={handleChange}
                maxLength={255}
                required
              />
            </label>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                type="submit"
                style={styles.button}
                disabled={saving}
              >
                {saving ? "Enregistrement..." : "Enregistrer"}
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
          <h2 style={{ color: "#012B1D", margin: 0 }}>
            {canManage ? "Liste des factures" : "Mes factures"}
          </h2>

          <input
            style={{
              ...styles.input,
              width: 280,
              marginTop: 0,
            }}
            placeholder="Rechercher une facture..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        {loading ? (
          <p>Chargement des factures...</p>
        ) : filteredFactures.length === 0 ? (
          <p style={{ color: "#64748B" }}>
            Aucune facture trouvée.
          </p>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Numéro</th>
                  <th style={styles.th}>Description</th>
                  {canManage && (
                    <th style={styles.th}>Client</th>
                  )}
                  <th style={styles.th}>Émission</th>
                  <th style={styles.th}>Échéance</th>
                  <th style={styles.th}>Montant TTC</th>
                  <th style={styles.th}>Statut</th>
                  {canManage && (
                    <th style={styles.th}>Actions</th>
                  )}
                </tr>
              </thead>

              <tbody>
                {filteredFactures.map((facture) => {
                  const client = clients.find(
                    (item) => item.id === facture.clientId
                  );

                  return (
                    <tr key={facture.id}>
                      <td style={styles.td}>
                        <strong>{facture.numero}</strong>
                      </td>

                      <td style={styles.td}>
                        {facture.description}
                      </td>

                      {canManage && (
                        <td style={styles.td}>
                          {client?.nom || `Client #${facture.clientId}`}
                        </td>
                      )}

                      <td style={styles.td}>
                        {facture.dateEmission}
                      </td>

                      <td style={styles.td}>
                        {facture.dateEcheance}

                        {facture.enRetard &&
                          facture.statut === "EMISE" && (
                            <div
                              style={{
                                color: "#DC2626",
                                fontSize: 11,
                              }}
                            >
                              En retard
                            </div>
                          )}
                      </td>

                      <td style={styles.td}>
                        <strong>
                          {formatMoney(facture.montantTTC)}
                        </strong>
                      </td>

                      <td style={styles.td}>
                        <span
                          style={{
                            ...statusStyle(facture.statut),
                            padding: "5px 9px",
                            borderRadius: 20,
                            fontSize: 11,
                            fontWeight: 700,
                          }}
                        >
                          {facture.statut}
                        </span>
                      </td>

                      {canManage && (
                        <td style={styles.td}>
                          <div
                            style={{
                              display: "flex",
                              gap: 6,
                              flexWrap: "wrap",
                            }}
                          >
                            {facture.statut === "EMISE" && (
                              <>
                                <button
                                  style={styles.secondary}
                                  onClick={() => openEditForm(facture)}
                                >
                                  Modifier
                                </button>

                                <button
                                  style={styles.secondary}
                                  onClick={() => handlePayment(facture.id)}
                                >
                                  Payer
                                </button>

                                <button
                                  style={styles.danger}
                                  onClick={() => handleCancel(facture.id)}
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
      </div>
    </div>
  );
}
