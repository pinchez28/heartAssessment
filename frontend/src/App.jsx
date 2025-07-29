import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Analysis from "./pages/Analysis";
import History from "./pages/History";
import Navbar from "./components/Navbar";

function AppLayout() {
  const { user, token, logout } = useAuth();
  const location = useLocation();

  const isAuthPage = ["/login", "/register", "/"].includes(location.pathname);

  return (
    <>
      <Navbar
        user={user}
        onLogout={logout}
        minimal={isAuthPage || !token}
      />

      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route
          path="/login"
          element={token ? <Navigate to="/dashboard" /> : <Login />}
        />
        <Route
          path="/register"
          element={token ? <Navigate to="/dashboard" /> : <Register />}
        />
        <Route
          path="/dashboard"
          element={token ? <Dashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/analysis"
          element={token ? <Analysis /> : <Navigate to="/login" />}
        />
        <Route
          path="/history"
          element={token ? <History /> : <Navigate to="/login" />}
        />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}
