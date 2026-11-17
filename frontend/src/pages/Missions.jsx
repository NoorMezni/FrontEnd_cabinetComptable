
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  RefreshCw,
  ClipboardList,
  Clock,
  PlayCircle,
  CheckCircle,
  CalendarDays,
  FileText,
  Wallet,
  Calculator,
  Pencil,
  XCircle,
  Send,
  Check,
  X,
  Filter,
} from "lucide-react";

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

import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import Notice from "../components/Notice";
import StatusBadge from "../components/StatusBadge";

import "../styles/Missions.css";

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

const STATUS_OPTIONS = [
  { value: "A_FAIRE", label: "À faire" },
  { value: "EN_COURS", label: "En cours" },
  { value: "VALIDEE", label: "Validée" },
  { value: "TERMINEE", label: "Terminée" },
  { value: "ANNULEE", label: "Annulée" },
];

const TYPE_OPTIONS = [
  { value: "DECLARATION", label: "Déclaration" },
  { value: "PAIE", label: "Paie" },
  { value: "COMPTABILITE", label: "Comptabilité" },
];

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("fr-FR");
}

function formatMoney(value) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  return (
    new Intl.NumberFormat("fr-TN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(value)) + " TND"
  );
}

function getTypeLabel(type) {
  const option = TYPE_OPTIONS.find((item) => item.value === type);
  return option?.label || type || "—";
}

function getClientName(mission, clients, user, isClient) {
  if (isClient) {
    return user?.nom || "Mon compte";
  }

  const client = clients.find(
    (item) => Number(item.id) === Number(mission.clientId)
  );

  return client?.nom || `Client #${mission.clientId}`;
}

function getMissionDetails(mission) {
  const details = mission.details || {};

  if (mission.typeMission === "DECLARATION") {
    return (
      <div className="mission-details">
        <strong>{details.typeDeclaration || "Déclaration"}</strong>
        <span>
          Période : {formatDate(details.periodeDebut)} –{" "}
          {formatDate(details.periodeFin)}
        </span>
        {details.montantDu != null && (
          <span>Montant dû : {formatMoney(details.montantDu)}</span>
        )}
        {details.dateDepot && (
          <span className="mission-deposit-info">
            Déposée le {formatDate(details.dateDepot)}
          </span>
        )}
      </div>
    );
  }

  if (mission.typeMission === "PAIE") {
    return (
      <div className="mission-details">
        <strong>Paie</strong>
        <span>Période : {details.periodePaie || "—"}</span>
        <span>Salariés : {details.nbSalaries ?? "—"}</span>
        <span>
          Masse salariale : {formatMoney(details.masseSalariale)}
        </span>
      </div>
    );
  }

  if (mission.typeMission === "COMPTABILITE") {
    return (
      <div className="mission-details">
        <strong>Comptabilité</strong>
        <span>Exercice : {details.exercice || "—"}</span>
        <span>Périodicité : {details.periodicite || "—"}</span>
        <span>Pièces traitées : {details.nbPiecesTraitees ?? "—"}</span>
      </div>
    );
  }

  return <span>—</span>;
}

function getTypeIcon(type) {
  if (type === "DECLARATION") return FileText;
  if (type === "PAIE") return Wallet;
  return Calculator;
}

function StatCard({ title, value, icon: Icon, color, background }) {
  return (
    <div className="mission-stat-card">
      <div
        className="mission-stat-icon"
        style={{ color, background }}
      >
        <Icon size={22} />
      </div>

      <div>
        <p className="mission-stat-title">{title}</p>
        <h2 className="mission-stat-value">{value}</h2>
      </div>
    </div>
  );
}

export default function Missions() {
  const { user } = useAuth();

  const isClient = user?.role === "CLIENT";

  const [missions, setMissions] = useState([]);
  const [clients, setClients] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("TOUS");
  const [typeFilter, setTypeFilter] = useState("TOUS");

  const [form, setForm] = useState({ ...emptyForm });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      if (isClient) {
        const missionsData = await getMyMissions();

        setMissions(
          Array.isArray(missionsData) ? missionsData : []
        );

        setClients([]);
      } else {
        const [missionsData, clientsData] = await Promise.all([
          getMissions(),
          getClients(),
        ]);

        setMissions(
          Array.isArray(missionsData) ? missionsData : []
        );

        setClients(
          Array.isArray(clientsData) ? clientsData : []
        );
      }
    } catch (err) {
      setError(
        err.message || "Impossible de charger les missions."
      );
    } finally {
      setLoading(false);
    }
  }, [isClient]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const statistics = useMemo(() => {
    return {
      total: missions.length,
      aFaire: missions.filter((m) => m.statut === "A_FAIRE").length,
      enCours: missions.filter((m) => m.statut === "EN_COURS").length,
      terminees: missions.filter((m) => m.statut === "TERMINEE").length,
    };
  }, [missions]);

  const filteredMissions = useMemo(() => {
    const term = search.trim().toLowerCase();

    return missions.filter((mission) => {
      const clientName = getClientName(
        mission,
        clients,
        user,
        isClient
      );

      const matchesSearch =
        !term ||
        String(mission.typeMission || "").toLowerCase().includes(term) ||
        getTypeLabel(mission.typeMission).toLowerCase().includes(term) ||
        String(mission.description || "").toLowerCase().includes(term) ||
        String(mission.statut || "").toLowerCase().includes(term) ||
        clientName.toLowerCase().includes(term) ||
        String(mission.clientId || "").includes(term);

      const matchesStatus =
        statusFilter === "TOUS" ||
        mission.statut === statusFilter;

      const matchesType =
        typeFilter === "TOUS" ||
        mission.typeMission === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [
    missions,
    clients,
    user,
    isClient,
    search,
    statusFilter,
    typeFilter,
  ]);

  function openCreateForm() {
    setForm({ ...emptyForm });
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

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm({ ...emptyForm });
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
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

      if (!data.clientId || data.clientId <= 0) {
        throw new Error("Veuillez sélectionner un client.");
      }

      if (data.dateLimite < data.dateDebut) {
        throw new Error(
          "La date limite doit être postérieure ou égale à la date de début."
        );
      }

      if (
        data.typeMission === "DECLARATION" &&
        data.periodeFin < data.periodeDebut
      ) {
        throw new Error(
          "La fin de période doit être postérieure ou égale au début de période."
        );
      }

      if (editingId) {
        await updateMission(editingId, data);
        setMessage("Mission modifiée avec succès.");
      } else {
        await createMission(data);
        setMessage("Mission créée avec succès.");
      }

      closeForm();
      await loadData();
    } catch (err) {
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setSaving(false);
    }
  }

  async function executeAction(action, id, confirmation) {
    if (confirmation && !window.confirm(confirmation)) {
      return;
    }

    setError("");
    setMessage("");

    try {
      await action(id);
      setMessage("Opération effectuée avec succès.");
      await loadData();
    } catch (err) {
      setError(
        err.message || "Impossible d'effectuer cette opération."
      );
    }
  }

  const inputClass = "mission-form-control";

  function field(label, name, type = "text", options = {}) {
    return (
      <div className="mission-form-field">
        <label htmlFor={name}>
          {label}
          {options.required && <span className="required-star"> *</span>}
        </label>

        <input
          id={name}
          className={inputClass}
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

  function selectField(label, name, options, required = false, disabled = false) {
    return (
      <div className="mission-form-field">
        <label htmlFor={name}>
          {label}
          {required && <span className="required-star"> *</span>}
        </label>

        <select
          id={name}
          className={inputClass}
          name={name}
          value={form[name]}
          onChange={handleChange}
          required={required}
          disabled={disabled}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  function renderActions(mission) {
    if (isClient) return null;

    const terminal = ["TERMINEE", "ANNULEE"].includes(
      mission.statut
    );

    return (
      <div className="mission-actions">
        {!terminal && mission.statut !== "VALIDEE" && (
          <button
            type="button"
            className="mission-action-button action-edit"
            title="Modifier"
            onClick={() => openEditForm(mission)}
          >
            <Pencil size={15} />
            <span>Modifier</span>
          </button>
        )}

        {mission.statut === "A_FAIRE" && (
          <button
            type="button"
            className="mission-action-button action-start"
            onClick={() =>
              executeAction(
                demarrerMission,
                mission.id,
                "Démarrer cette mission ?"
              )
            }
          >
            <PlayCircle size={15} />
            <span>Démarrer</span>
          </button>
        )}

        {mission.statut === "EN_COURS" && (
          <button
            type="button"
            className="mission-action-button action-validate"
            onClick={() =>
              executeAction(
                validerMission,
                mission.id,
                "Valider cette mission ?"
              )
            }
          >
            <CheckCircle size={15} />
            <span>Valider</span>
          </button>
        )}

        {mission.statut === "VALIDEE" && (
          <button
            type="button"
            className="mission-action-button action-finish"
            onClick={() =>
              executeAction(
                terminerMission,
                mission.id,
                "Terminer cette mission ?"
              )
            }
          >
            <Check size={15} />
            <span>Terminer</span>
          </button>
        )}

        {["A_FAIRE", "EN_COURS", "VALIDEE"].includes(
          mission.statut
        ) && (
          <button
            type="button"
            className="mission-action-button action-cancel"
            onClick={() =>
              executeAction(
                annulerMission,
                mission.id,
                "Annuler définitivement cette mission ?"
              )
            }
          >
            <XCircle size={15} />
            <span>Annuler</span>
          </button>
        )}

        {mission.typeMission === "DECLARATION" &&
          !terminal &&
          mission.statut !== "VALIDEE" &&
          !mission.details?.dateDepot && (
            <button
              type="button"
              className="mission-action-button action-deposit"
              onClick={() =>
                executeAction(
                  deposerMission,
                  mission.id,
                  "Confirmer le dépôt de cette déclaration ?"
                )
              }
            >
              <Send size={15} />
              <span>Déposer</span>
            </button>
          )}
      </div>
    );
  }

  return (
    <div className="missions-page">
      <div className="missions-header">
        <div>
          <div className="missions-title-line">
            <div className="missions-title-icon">
              <ClipboardList size={25} />
            </div>

            <div>
              <h1>Gestion des missions</h1>
              <p>
                Suivez les missions et leur état d'avancement.
              </p>
            </div>
          </div>
        </div>

        <div className="missions-header-actions">
          <button
            type="button"
            className="mission-refresh-button"
            onClick={loadData}
            disabled={loading}
            title="Actualiser"
          >
            <RefreshCw size={17} />
            Actualiser
          </button>

          {!isClient && (
            <button
              type="button"
              className="mission-primary-button"
              onClick={openCreateForm}
            >
              <Plus size={18} />
              Nouvelle mission
            </button>
          )}
        </div>
      </div>

      {message && (
        <div className="missions-notice">
          <Notice
            type="success"
            title="Opération réussie"
            message={message}
          />
        </div>
      )}

      {error && (
        <div className="missions-notice">
          <ErrorMessage
            message={error}
            onRetry={loadData}
          />
        </div>
      )}

      <div className="missions-stats-grid">
        <StatCard
          title="Total des missions"
          value={statistics.total}
          icon={ClipboardList}
          color="#064B35"
          background="#E5F3EC"
        />

        <StatCard
          title="À faire"
          value={statistics.aFaire}
          icon={Clock}
          color="#946200"
          background="#FFF0D6"
        />

        <StatCard
          title="En cours"
          value={statistics.enCours}
          icon={PlayCircle}
          color="#1755A0"
          background="#DCEBFF"
        />

        <StatCard
          title="Terminées"
          value={statistics.terminees}
          icon={CheckCircle}
          color="#087443"
          background="#DDF5E8"
        />
      </div>

      {showForm && (
        <div className="mission-form-card">
          <div className="mission-form-header">
            <div>
              <h2>
                {editingId ? "Modifier la mission" : "Nouvelle mission"}
              </h2>
              <p>
                Renseignez les informations nécessaires à la mission.
              </p>
            </div>

            <button
              type="button"
              className="mission-close-button"
              onClick={closeForm}
              aria-label="Fermer le formulaire"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mission-form-grid">
              {selectField(
                "Type de mission",
                "typeMission",
                TYPE_OPTIONS,
                true,
                !!editingId
              )}

              <div className="mission-form-field">
                <label htmlFor="clientId">
                  Client <span className="required-star">*</span>
                </label>

                <select
                  id="clientId"
                  className={inputClass}
                  name="clientId"
                  value={form.clientId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Sélectionner un client</option>

                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.nom}
                    </option>
                  ))}
                </select>
              </div>

              {field("Date de début", "dateDebut", "date", {
                required: true,
              })}

              {field("Date limite", "dateLimite", "date", {
                required: true,
              })}

              <div className="mission-form-field mission-form-full">
                <label htmlFor="description">Description</label>

                <textarea
                  id="description"
                  className={inputClass}
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Description de la mission..."
                />
              </div>

              {form.typeMission === "DECLARATION" && (
                <>
                  {selectField(
                    "Type de déclaration",
                    "typeDeclaration",
                    [
                      { value: "TVA", label: "TVA" },
                      { value: "IS_IR", label: "IS / IR" },
                      { value: "CNSS", label: "CNSS" },
                      {
                        value: "RETENUE_SOURCE",
                        label: "Retenue à la source",
                      },
                    ],
                    true
                  )}

                  {field(
                    "Début de période",
                    "periodeDebut",
                    "date",
                    { required: true }
                  )}

                  {field(
                    "Fin de période",
                    "periodeFin",
                    "date",
                    { required: true }
                  )}

                  {field(
                    "Montant dû (TND)",
                    "montantDu",
                    "number",
                    { min: 0, step: "0.01" }
                  )}
                </>
              )}

              {form.typeMission === "PAIE" && (
                <>
                  {field(
                    "Période de paie",
                    "periodePaie",
                    "month",
                    { required: true }
                  )}

                  {field(
                    "Nombre de salariés",
                    "nbSalaries",
                    "number",
                    { min: 0, step: 1 }
                  )}

                  {field(
                    "Masse salariale (TND)",
                    "masseSalariale",
                    "number",
                    { min: 0, step: "0.01" }
                  )}
                </>
              )}

              {form.typeMission === "COMPTABILITE" && (
                <>
                  {field("Exercice", "exercice", "number", {
                    required: true,
                    min: 1990,
                    max: 2100,
                  })}

                  {selectField(
                    "Périodicité",
                    "periodicite",
                    [
                      { value: "MENSUELLE", label: "Mensuelle" },
                      { value: "TRIMESTRIELLE", label: "Trimestrielle" },
                      { value: "ANNUELLE", label: "Annuelle" },
                    ],
                    true
                  )}

                  {field(
                    "Nombre de pièces traitées",
                    "nbPiecesTraitees",
                    "number",
                    { min: 0, step: 1 }
                  )}
                </>
              )}
            </div>

            <div className="mission-form-footer">
              <button
                type="button"
                className="mission-secondary-button"
                onClick={closeForm}
                disabled={saving}
              >
                Annuler
              </button>

              <button
                type="submit"
                className="mission-primary-button"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <RefreshCw size={16} className="mission-spinning" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Check size={17} />
                    {editingId ? "Enregistrer les modifications" : "Créer la mission"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="missions-list-card">
        <div className="missions-list-header">
          <div>
            <h2>Liste des missions</h2>
            <p>
              {filteredMissions.length} résultat(s) affiché(s)
              {" "}sur {missions.length}
            </p>
          </div>
        </div>

        <div className="missions-filters">
          <div className="mission-search-wrapper">
            <Search size={18} />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher une mission, un client..."
              aria-label="Rechercher une mission"
            />
          </div>

          <div className="mission-filter-control">
            <Filter size={17} />

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filtrer par statut"
            >
              <option value="TOUS">Tous les statuts</option>

              {STATUS_OPTIONS.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mission-filter-control">
            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              aria-label="Filtrer par type"
            >
              <option value="TOUS">Tous les types</option>

              {TYPE_OPTIONS.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <Loading message="Chargement des missions..." />
        ) : filteredMissions.length === 0 ? (
          <div className="missions-empty-state">
            <div className="missions-empty-icon">
              <ClipboardList size={32} />
            </div>

            <h3>Aucune mission trouvée</h3>

            <p>
              {search || statusFilter !== "TOUS" || typeFilter !== "TOUS"
                ? "Essayez de modifier vos critères de recherche."
                : "Aucune mission n'est disponible pour le moment."}
            </p>

            {(search || statusFilter !== "TOUS" || typeFilter !== "TOUS") && (
              <button
                type="button"
                className="mission-secondary-button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("TOUS");
                  setTypeFilter("TOUS");
                }}
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>
        ) : (
          <div className="missions-table-wrapper">
            <table className="missions-table">
              <thead>
                <tr>
                  <th>Mission</th>
                  {!isClient && <th>Client</th>}
                  <th>Dates</th>
                  <th>Statut</th>
                  <th>Détails</th>
                  {!isClient && <th>Actions</th>}
                </tr>
              </thead>

              <tbody>
                {filteredMissions.map((mission) => {
                  const TypeIcon = getTypeIcon(mission.typeMission);

                  const terminal = [
                    "TERMINEE",
                    "ANNULEE",
                  ].includes(mission.statut);

                  return (
                    <tr key={mission.id}>
                      <td>
                        <div className="mission-name-cell">
                          <div className="mission-type-icon">
                            <TypeIcon size={19} />
                          </div>

                          <div>
                            <strong>
                              {getTypeLabel(mission.typeMission)}
                            </strong>

                            <span>
                              {mission.description || "Sans description"}
                            </span>

                            <small>Mission #{mission.id}</small>
                          </div>
                        </div>
                      </td>

                      {!isClient && (
                        <td>
                          <span className="mission-client-name">
                            {getClientName(
                              mission,
                              clients,
                              user,
                              isClient
                            )}
                          </span>
                        </td>
                      )}

                      <td>
                        <div className="mission-date-cell">
                          <span>
                            <CalendarDays size={14} />
                            Début : {formatDate(mission.dateDebut)}
                          </span>

                          <span
                            className={
                              mission.enRetard && !terminal
                                ? "mission-date-late"
                                : ""
                            }
                          >
                            <Clock size={14} />
                            Limite : {formatDate(mission.dateLimite)}
                          </span>

                          {mission.enRetard && !terminal && (
                            <small className="mission-late-label">
                              En retard
                            </small>
                          )}
                        </div>
                      </td>

                      <td>
                        <StatusBadge status={mission.statut} />
                      </td>

                      <td>{getMissionDetails(mission)}</td>

                      {!isClient && (
                        <td>{renderActions(mission)}</td>
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
