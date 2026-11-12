
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/Login.css";

export default function Login() {
    const { login, loading } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [motDePasse, setMotDePasse] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const data = await login(email, motDePasse);

            if (["ADMIN", "COMPTABLE", "CLIENT"].includes(data.role)) {
                navigate("/dashboard");
            }
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="login-page">

            <div className="login-card">

                <Link to="/" className="login-brand">
                    <span>C.</span> Cabinet Comptable
                </Link>

                <h2>Connexion</h2>
                <p className="login-subtitle">
                    Connectez-vous à votre compte.
                </p>

                <form onSubmit={handleSubmit}>

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Votre adresse email"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Mot de passe</label>
                        <input
                            id="password"
                            type="password"
                            value={motDePasse}
                            onChange={(e) => setMotDePasse(e.target.value)}
                            placeholder="Votre mot de passe"
                            required
                        />
                    </div>

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <button type="submit" disabled={loading}>
                        {loading ? "Connexion..." : "Se connecter"}
                    </button>

                </form>

                <Link to="/" className="login-back">
                    Retour à l'accueil
                </Link>

            </div>

        </div>
    );
}
