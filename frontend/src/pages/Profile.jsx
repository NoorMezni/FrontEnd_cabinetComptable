
import { useState } from "react";
import { updateProfile } from "../api/profileApi";
import { useAuth } from "../hooks/useAuth";
export default function Profile() {
  const { user } = useAuth();

  const [form, setForm] = useState({
    nom: user?.nom || "",
    email: user?.email || "",
    telephone: user?.telephone || "",
    adresse: user?.adresse || "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const isClient = user?.role === "CLIENT";

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    const data = {
      nom: form.nom.trim(),
      email: form.email.trim(),
      telephone: form.telephone.trim(),
    };

    if (isClient) {
      data.adresse = form.adresse.trim();
    }

    Object.keys(data).forEach((key) => {
      if (data[key] === "") delete data[key];
    });

    try {
      await updateProfile(data);
      setMessage("Profil mis à jour avec succès.");
    } catch (err) {
      setError(err.message || "Impossible de modifier le profil.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Mon profil</h1>
          <p>Consultez et modifiez vos informations personnelles.</p>
        </div>
      </div>

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label>Nom complet</label>
            <input
              name="nom"
              value={form.nom}
              onChange={handleChange}
              placeholder="Votre nom"
            />
          </div>

          <div className="form-group">
            <label>Adresse e-mail</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Votre adresse e-mail"
            />
          </div>

          <div className="form-group">
            <label>Téléphone</label>
            <input
              name="telephone"
              value={form.telephone}
              onChange={handleChange}
              placeholder="Votre numéro de téléphone"
            />
          </div>

          {isClient && (
            <div className="form-group">
              <label>Adresse</label>
              <input
                name="adresse"
                value={form.adresse}
                onChange={handleChange}
                placeholder="Votre adresse"
              />
            </div>
          )}
        </div>

        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}

        <button type="submit" disabled={loading} className="primary-button">
          {loading ? "Enregistrement..." : "Enregistrer les modifications"}
        </button>
      </form>
    </div>
  );
}
