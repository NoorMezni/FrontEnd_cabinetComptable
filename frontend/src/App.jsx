
import { Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Comptables from "./pages/Comptables";
import Profile from "./pages/Profile";
import Factures from "./pages/Factures";
import Missions from "./pages/Missions";
import Documents from "./pages/Documents";

import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/AppLayout";

function PrivatePage({ children }) {
  return (
    <ProtectedRoute>
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />

      <Route
        path="/dashboard"
        element={<PrivatePage><Dashboard /></PrivatePage>}
      />

      <Route
        path="/clients"
        element={<PrivatePage><Clients /></PrivatePage>}
      />

      <Route
        path="/comptables"
        element={<PrivatePage><Comptables /></PrivatePage>}
      />

      <Route
        path="/factures"
        element={<PrivatePage><Factures /></PrivatePage>}
      />

      <Route
        path="/missions"
        element={<PrivatePage><Missions /></PrivatePage>}
      />

      <Route
        path="/documents"
        element={<PrivatePage><Documents /></PrivatePage>}
      />

      <Route
        path="/profile"
        element={<PrivatePage><Profile /></PrivatePage>}
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
