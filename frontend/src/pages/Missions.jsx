
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { getClients } from "../api/clientApi";
import {
  getMissions,
  getMyMissions,
  createMission,
  updateMission,
  demarrerMission,
  validerMission,
  terminerMission,
  annulerMission,
  deposerMission,
} from "../api/missionApi";

const emptyForm = {
  typeMission: "DECLARATION",
  description: "",
  dateDebut: "",
  dateLimite: "",
  clientId: "",
  typeDeclaration: "TVA",
  periodeDebut: "",
  periodeFin: "",
  montantDu: "",
  periodePaie: "",
  nbSalaries: "",
  masseSalariale: "",
  exercice: new Date().getFullYear(),
  periodicite: "MENSUELLE",
  nbPiecesTraitees: "",
};

function formatDate(value) {
  if (!value) return "—";
  return new Date(value + "T00:00:00").toLocaleDateString("fr-FR");
}

function formatMoney(value) {
  return new Intl.NumberFormat("fr-TN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0)) + " TND";
}

function statusStyle(status) {
  const styles = {
    A_FAIRE: { background: "#FFF0D6", color: "#946200" },
    EN_COURS: { background: "#DCEBFF", color: "#1755A0" },
    VALIDEE: { background: "#EDE4FF", color: "#6941A5" },
    TERMINEE: { background: "#DDF5E8", color: "#087443" },
    ANNULEE: { background: "#FCE4E4", color: "#B42318" },
  };

  return styles[status] || { background: "#EEEEEE", color: "#555555" };
}

export default function Missions() {
  const { user } = useAuth();
  const isClient = user?.role === "CLIENT";

  const [missions, setMissions] = useState([]);
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      if (isClient) {
        const missionsData = await getMyMissions();
        setMissions(Array.isArray(missionsData) ? missionsData : []);
      } else {
        const [missionsData, clientsData] = await Promise.all([
          getMissions(),
          getClients(),
        ]);

        setMissions(Array.isArray(missionsData) ? missionsData : []);
        setClients(Array.isArray(clientsData) ? clientsData : []);
      }
    } catch (err) {
      setError(err.message || "Impossible de charger les missions.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function openCreateForm() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
    setError("");
    setMessage("");
  }

  function openEditForm(mission) {
    const details = mission.details || {};

    setForm({
      typeMission: mission.typeMission || "DECLARATION",
      description: mission.description || "",
      dateDebut: mission.dateDebut || "",
      dateLimite: mission.dateLimite || "",
      clientId: String(mission.clientId || ""),
      typeDeclaration: details.typeDeclaration || "TVA",
      periodeDebut: details.periodeDebut || "",
      periodeFin: details.periodeFin || "",
      montantDu: details.montantDu ?? "",
      periodePaie: details.periodePaie || "",
      nbSalaries: details.nbSalaries ?? "",
      masseSalariale: details.masseSalariale ?? "",
      exercice: details.exercice || new Date().getFullYear(),
      periodicite: details.periodicite || "MENSUELLE",
      nbPiecesTraitees: details.nbPiecesTraitees ?? "",
    });

    setEditingId(mission.id);
    setShowForm(true);
    setError("");
    setMessage("");
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  function buildMissionData() {
    const data = {
      typeMission: form.typeMission,
      description: form.description.trim(),
      dateDebut: form.dateDebut,
      dateLimite: form.dateLimite,
      clientId: Number(form.clientId),
    };

    if (form.typeMission === "DECLARATION") {
      data.typeDeclaration = form.typeDeclaration;
      data.periodeDebut = form.periodeDebut;
      data.periodeFin = form.periodeFin;

      if (form.montantDu !== "") {
        data.montantDu = Number(form.montantDu);
      }
    }

    if (form.typeMission === "PAIE") {
      data.periodePaie = form.periodePaie;

      if (form.nbSalaries !== "") {
        data.nbSalaries = Number(form.nbSalaries);
      }

      if (form.masseSalariale !== "") {
        data.masseSalariale = Number(form.masseSalariale);
      }
    }

    if (form.typeMission === "COMPTABILITE") {
      data.exercice = Number(form.exercice);
      data.periodicite = form.periodicite;

      if (form.nbPiecesTraitees !== "") {
        data.nbPiecesTraitees = Number(form.nbPiecesTraitees);
      }
    }

    return data;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const data = buildMissionData();

      if (editingId) {
        await updateMission(editingId, data);
        setMessage("Mission modifiée avec succès.");
      } else {
        await createMission(data);
        setMessage("Mission créée avec succès.");
      }

      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      await loadData();
    } catch (err) {
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setSaving(false);
    }
  }

  async function executeAction(action, id, confirmation) {
    if (confirmation && !window.confirm(confirmation)) return;

    setError("");
    setMessage("");

    try {
      await action(id);
      setMessage("Opération effectuée avec succès.");
      await loadData();
    } catch (err) {
      setError(err.message || "Impossible d'effectuer cette opération.");
    }
  }

  const filteredMissions = missions.filter((mission) => {
    const term = search.toLowerCase();

    return (
      String(mission.typeMission || "").toLowerCase().includes(term) ||
      String(mission.description || "").toLowerCase().includes(term) ||
      String(mission.statut || "").toLowerCase().includes(term) ||
      String(mission.clientId || "").includes(term)
    );
  });

  const inputStyle = {
    width: "100%",
    padding: "11px 12px",
    border: "1px solid #D5DED8",
    borderRadius: "8px",
    fontSize: "14px",
    boxSizing: "border-box",
    background: "white",
  };

  const labelStyle = {
    display: "block",
    marginBottom: "7px",
    fontWeight: "600",
    fontSize: "13px",
    color: "#294438",
  };

  function field(label, name, type = "text", options = {}) {
    return (
      <div>
        <label style={labelStyle}>{label}</label>
        <input
          style={inputStyle}
          type={type}
          name={name}
          value={form[name]}
          onChange={handleChange}
          required={options.required}
          min={options.min}
          max={options.max}
          step={options.step}
          placeholder={options.placeholder}
        />
      </div>
    );
  }

  return (
    <div>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "15px",
        flexWrap: "wrap",
        marginBottom: "25px",
      }}>
        <div>
          <h1 style={{ color: "#012B1D", margin: "0 0 7px" }}>
            Gestion des missions
          </h1>
          <p style={{ color: "#718078", margin: 0 }}>
            Suivez les missions et leur état d'avancement.
          </p>
        </div>

        {!isClient && (
          <button onClick={openCreateForm} style={{
            background: "#012B1D",
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "12px 18px",
            cursor: "pointer",
            fontWeight: "600",
          }}>
            + Nouvelle mission
          </button>
        )}
      </div>

      {message && (
        <p style={{ background: "#DDF5E8", color: "#087443", padding: "12px", borderRadius: "8px" }}>
          {message}
        </p>
      )}

      {error && (
        <p style={{ background: "#FCE4E4", color: "#B42318", padding: "12px", borderRadius: "8px" }}>
          {error}
        </p>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} style={{
          background: "white",
          padding: "24px",
          borderRadius: "12px",
          marginBottom: "25px",
          border: "1px solid #E2EAE5",
        }}>
          <h2 style={{ marginTop: 0, color: "#012B1D" }}>
            {editingId ? "Modifier la mission" : "Créer une mission"}
          </h2>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "18px",
          }}>
            <div>
              <label style={labelStyle}>Type de mission *</label>
              <select
                style={inputStyle}
                name="typeMission"
                value={form.typeMission}
                onChange={handleChange}
                disabled={!!editingId}
                required
              >
                <option value="DECLARATION">Déclaration</option>
                <option value="PAIE">Paie</option>
                <option value="COMPTABILITE">Comptabilité</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Client *</label>
              <select style={inputStyle} name="clientId" value={form.clientId} onChange={handleChange} required>
                <option value="">Sélectionner un client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.nom}
                  </option>
                ))}
              </select>
            </div>

            {field("Date de début *", "dateDebut", "date", { required: true })}
            {field("Date limite *", "dateLimite", "date", { required: true })}

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Description</label>
              <textarea
                style={{ ...inputStyle, minHeight: "75px", resize: "vertical" }}
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Description de la mission..."
              />
            </div>

            {form.typeMission === "DECLARATION" && (
              <>
                <div>
                  <label style={labelStyle}>Type de déclaration *</label>
                  <select style={inputStyle} name="typeDeclaration" value={form.typeDeclaration} onChange={handleChange} required>
                    <option value="TVA">TVA</option>
                    <option value="IS_IR">IS / IR</option>
                    <option value="CNSS">CNSS</option>
                    <option value="RETENUE_SOURCE">Retenue à la source</option>
                  </select>
                </div>

                {field("Début de période *", "periodeDebut", "date", { required: true })}
                {field("Fin de période *", "periodeFin", "date", { required: true })}
                {field("Montant dû (TND)", "montantDu", "number", { min: 0, step: "0.01" })}
              </>
            )}

            {form.typeMission === "PAIE" && (
              <>
                {field("Période de paie *", "periodePaie", "month", { required: true })}
                {field("Nombre de salariés", "nbSalaries", "number", { min: 0, step: 1 })}
                {field("Masse salariale (TND)", "masseSalariale", "number", { min: 0, step: "0.01" })}
              </>
            )}

            {form.typeMission === "COMPTABILITE" && (
              <>
                {field("Exercice *", "exercice", "number", { required: true, min: 1990, max: 2100 })}
                <div>
                  <label style={labelStyle}>Périodicité *</label>
                  <select style={inputStyle} name="periodicite" value={form.periodicite} onChange={handleChange} required>
                    <option value="MENSUELLE">Mensuelle</option>
                    <option value="TRIMESTRIELLE">Trimestrielle</option>
                    <option value="ANNUELLE">Annuelle</option>
                  </select>
                </div>
                {field("Nombre de pièces traitées", "nbPiecesTraitees", "number", { min: 0, step: 1 })}
              </>
            )}
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
            <button type="submit" disabled={saving} style={{
              background: "#01B36C",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "11px 18px",
              cursor: "pointer",
            }}>
              {saving ? "Enregistrement..." : editingId ? "Enregistrer" : "Créer la mission"}
            </button>

            <button type="button" onClick={() => setShowForm(false)} style={{
              background: "#EDF1EE",
              color: "#294438",
              border: "none",
              borderRadius: "8px",
              padding: "11px 18px",
              cursor: "pointer",
            }}>
              Fermer
            </button>
          </div>
        </form>
      )}

      <div style={{
        background: "white",
        padding: "18px",
        borderRadius: "12px",
        border: "1px solid #E2EAE5",
      }}>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Rechercher par type, description ou statut..."
          style={{ ...inputStyle, maxWidth: "450px", marginBottom: "20px" }}
        />

        {loading ? (
          <p>Chargement des missions...</p>
        ) : filteredMissions.length === 0 ? (
          <p style={{ color: "#718078", textAlign: "center", padding: "25px" }}>
            Aucune mission trouvée.
          </p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "950px" }}>
              <thead>
                <tr style={{ background: "#F3F7F4", textAlign: "left" }}>
                  {["Type", "Client", "Date début", "Date limite", "Statut", "Détails", "Actions"].map((heading) => (
                    <th key={heading} style={{ padding: "13px 12px", fontSize: "12px", color: "#52665B" }}>
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredMissions.map((mission) => {
                  const client = clients.find((item) => item.id === mission.clientId);
                  const details = mission.details || {};
                  const terminal = ["TERMINEE", "ANNULEE"].includes(mission.statut);

                  return (
                    <tr key={mission.id} style={{ borderTop: "1px solid #E9EFEB" }}>
                      <td style={{ padding: "14px 12px", fontWeight: "600" }}>
                        {mission.typeMission}
                      </td>
                      <td style={{ padding: "14px 12px" }}>
                        {client?.nom || (isClient ? user?.nom : `Client #${mission.clientId}`)}
                      </td>
                      <td style={{ padding: "14px 12px" }}>{formatDate(mission.dateDebut)}</td>
                      <td style={{ padding: "14px 12px" }}>
                        {formatDate(mission.dateLimite)}
                        {mission.enRetard && !terminal && (
                          <div style={{ color: "#B42318", fontSize: "11px", marginTop: "4px" }}>
                            En retard
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "14px 12px" }}>
                        <span style={{
                          ...statusStyle(mission.statut),
                          padding: "5px 9px",
                          borderRadius: "20px",
                          fontSize: "12px",
                          fontWeight: "600",
                        }}>
                          {mission.statut}
                        </span>
                      </td>
                      <td style={{ padding: "14px 12px", fontSize: "12px", maxWidth: "210px" }}>
                        {mission.typeMission === "DECLARATION" && (
                          <>
                            {details.typeDeclaration || "Déclaration"}
                            <br />
                            Période : {formatDate(details.periodeDebut)} – {formatDate(details.periodeFin)}
                            {details.montantDu != null && <><br />Montant : {formatMoney(details.montantDu)}</>}
                          </>
                        )}

                        {mission.typeMission === "PAIE" && (
                          <>
                            Période : {details.periodePaie || "—"}
                            <br />
                            Salariés : {details.nbSalaries ?? "—"}
                            <br />
                            Masse : {formatMoney(details.masseSalariale)}
                          </>
                        )}

                        {mission.typeMission === "COMPTABILITE" && (
                          <>
                            Exercice : {details.exercice || "—"}
                            <br />
                            {details.periodicite || "—"}
                            <br />
                            Pièces : {details.nbPiecesTraitees ?? "—"}
                          </>
                        )}
                      </td>
                      <td style={{ padding: "14px 12px" }}>
                        {!isClient && (
                          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                            {!terminal && mission.statut !== "VALIDEE" && (
                              <button onClick={() => openEditForm(mission)} style={smallButton("#EAF1ED", "#294438")}>
                                Modifier
                              </button>
                            )}

                            {mission.statut === "A_FAIRE" && (
                              <button onClick={() => executeAction(demarrerMission, mission.id, "Démarrer cette mission ?")} style={smallButton("#DCEBFF", "#1755A0")}>
                                Démarrer
                              </button>
                            )}

                            {mission.statut === "EN_COURS" && (
                              <button onClick={() => executeAction(validerMission, mission.id, "Valider cette mission ?")} style={smallButton("#EDE4FF", "#6941A5")}>
                                Valider
                              </button>
                            )}

                            {mission.statut === "VALIDEE" && (
                              <button onClick={() => executeAction(terminerMission, mission.id, "Terminer cette mission ?")} style={smallButton("#DDF5E8", "#087443")}>
                                Terminer
                              </button>
                            )}

                            {["A_FAIRE", "EN_COURS", "VALIDEE"].includes(mission.statut) && (
                              <button onClick={() => executeAction(annulerMission, mission.id, "Annuler définitivement cette mission ?")} style={smallButton("#FCE4E4", "#B42318")}>
                                Annuler
                              </button>
                            )}

                            {mission.typeMission === "DECLARATION" &&
                              !terminal &&
                              mission.statut !== "VALIDEE" &&
                              !details.dateDepot && (
                                <button onClick={() => executeAction(deposerMission, mission.id, "Confirmer le dépôt de cette déclaration ?")} style={smallButton("#FFF0D6", "#946200")}>
                                  Déposer
                                </button>
                              )}
                          </div>
                        )}
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

function smallButton(background, color) {
  return {
    background,
    color,
    border: "none",
    borderRadius: "6px",
    padding: "7px 9px",
    fontSize: "12px",
    cursor: "pointer",
    whiteSpace: "nowrap",
  };
}
