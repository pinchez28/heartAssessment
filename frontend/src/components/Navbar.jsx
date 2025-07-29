import { Link, useLocation } from "react-router-dom";
import { FiLogOut, FiUser, FiMenu } from "react-icons/fi";
import { useState } from "react";
import logo from "../assets/logo.png";

export default function Navbar({ user, onLogout, minimal = false }) {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);


  const isAuthPage = ["/login", "/register"].includes(location.pathname);
  if (minimal || isAuthPage) {
    return (
      <nav className="navbar form-grid-3col">
        <div className="navbar-left">
          <span className="navbar-logo form-grid-3col">
            <img src={logo} alt="logo" className="logo-image" />
            <span className="navbar-title">HeartHealth</span>
          </span>
        </div>
      </nav>
    );
  }

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <span className="navbar-logo">
          <img src={logo} alt="logo" className="logo-image" />
          <span className="navbar-title">Heart Assessment</span>
        </span>
      </div>

      {/* Hamburger button visible on mobile */}
      <FiMenu
        className="hamburger"
        onClick={() => setMenuOpen(!menuOpen)}
      />

      <div className={`navbar-center ${menuOpen ? "open" : ""}`}>
        <Link
          to="/dashboard"
          className={`nav-link ${location.pathname === "/dashboard" ? "active-link" : ""}`}
          onClick={() => setMenuOpen(false)}
        >
          Dashboard
        </Link>
        <Link
          to="/history"
          className={`nav-link ${location.pathname === "/history" ? "active-link" : ""}`}
          onClick={() => setMenuOpen(false)}
        >
          History
        </Link>
      </div>

      <div className="navbar-right">
        <FiUser className="user-icon" />
        <div className="user-details">
          <span className="user-name">
            {user?.name
              ? user.name.charAt(0).toUpperCase() + user.name.slice(1).toLowerCase()
              : ""}
          </span>
          <span className="user-name text-xs">{user?.email || ""}</span>
        </div>
        <FiLogOut className="logout-icon" onClick={onLogout} />
      </div>
    </nav>
  );
}
