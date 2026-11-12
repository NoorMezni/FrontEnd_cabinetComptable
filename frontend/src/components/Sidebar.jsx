
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { logoutApi } from "../api/authApi";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const role = user?.role;

  async function handleLogout() {
    try {
      await logoutApi();
    } catch (error) {
      console.error("Erreur de déconnexion :", error);
    } finally {
      logout();
      navigate("/login");
    }
  }

  const links = [
    { label: "Dashboard", path: "/dashboard", roles: ["ADMIN", "COMPTABLE", "CLIENT"] },
    { label: "Clients", path: "/clients", roles: ["ADMIN", "COMPTABLE"] },
    { label: "Comptables", path: "/comptables", roles: ["ADMIN"] },
    { label: "Factures", path: "/factures", roles: ["ADMIN", "COMPTABLE", "CLIENT"] },
    { label: "Missions", path: "/missions", roles: ["ADMIN", "COMPTABLE", "CLIENT"] },
    { label: "Documents", path: "/documents", roles: ["ADMIN", "COMPTABLE", "CLIENT"] },
    { label: "Mon profil", path: "/profile", roles: ["ADMIN", "COMPTABLE", "CLIENT"] },
  ];

  const visibleLinks = links.filter((link) => link.roles.includes(role));

  return (
    <aside
      style={{
        width: 250,
        minWidth: 250,
        minHeight: "100vh",
        background: "#012B1D",
        color: "white",
        padding: "28px 18px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h2 style={{ margin: "0 0 8px", fontSize: 21 }}>
        Cabinet Comptable
      </h2>

      <p style={{ color: "#A8C5B6", fontSize: 12, marginBottom: 35 }}>
        Espace de gestion
      </p>

      <div style={{ marginBottom: 25 }}>
        <div style={{ fontWeight: 600 }}>{user?.nom || "Utilisateur"}</div>
        <div style={{ color: "#A8C5B6", fontSize: 12, marginTop: 4 }}>
          {role}
        </div>
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {visibleLinks.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            style={({ isActive }) => ({
              color: "white",
              textDecoration: "none",
              padding: "12px 14px",
              borderRadius: 8,
              background: isActive ? "#087A50" : "transparent",
              fontSize: 14,
              fontWeight: isActive ? 700 : 400,
            })}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={handleLogout}
        style={{
          marginTop: "auto",
          padding: 12,
          border: "1px solid #47705E",
          borderRadius: 8,
          background: "transparent",
          color: "white",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        Déconnexion
      </button>
    </aside>
  );
}