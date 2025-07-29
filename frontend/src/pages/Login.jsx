import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "../api";
import { useAuth } from "../context/AuthContext";
import { FiEye, FiEyeOff } from "react-icons/fi";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const togglePassword = () => setShowPassword((prev) => !prev);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post("/login", formData);
      const token = res.data.access_token;

      // Save token and user info to sessionStorage
      sessionStorage.setItem("access_token", token);
      sessionStorage.setItem("user", JSON.stringify(res.data.user));

      // Update context
      login(res.data.user, token);

      navigate("/dashboard");
    } catch (err) {
      if (err.response) {
        if (err.response.status === 404) {
          setError("User not found. Please register.");
        } else if (err.response.status === 401) {
          setError("Incorrect password. Try again.");
        } else if (err.response.status === 400) {
          setError("Email and password are required.");
        } else {
          setError(err.response.data?.msg || "Login failed.");
        }
      } else if (err.request) {
        setError("No response from server. Check your connection.");
      } else {
        setError("Error: " + err.message);
      }
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label>Email</label>
        <input
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <label>Password</label>
        <div className="password-wrapper">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleChange}
            required
          />
          <span onClick={togglePassword} className="password-toggle">
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </span>
        </div>

        {error && <p className="auth-error">{error}</p>}

        <button className="auth-btn" type="submit">
          Login
        </button>
      </form>

      <div className="auth-footer">
        Don’t have an account?{" "}
        <Link to="/register" className="auth-switch-link">
          Register
        </Link>
      </div>
    </div>
  );
}
