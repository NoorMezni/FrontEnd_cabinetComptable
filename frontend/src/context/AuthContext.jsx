
import {
    createContext,
    useContext,
    useState
} from "react";

import { loginApi, logoutApi } from "../api/authApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {

    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("user");
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const [loading, setLoading] = useState(false);

    // Login
    const login = async (email, motDePasse) => {
        setLoading(true);

        try {
            const data = await loginApi(email, motDePasse);

            // Save token
            localStorage.setItem("token", data.token);

            // Save user information
            const userData = {
                nom: data.nom,
                role: data.role
            };

            localStorage.setItem("user", JSON.stringify(userData));
            setUser(userData);

            return data;

        } finally {
            setLoading(false);
        }
    };

    // Logout
    const logout = async () => {
        try {
            if (localStorage.getItem("token")) {
                await logoutApi();
            }
        } catch (error) {
            console.error("Erreur de déconnexion:", error);
        } finally {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                isAuthenticated: !!user,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

// Custom hook
export function useAuth() {
    return useContext(AuthContext);
}
