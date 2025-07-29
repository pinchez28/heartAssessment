import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "../api";
import { FiEye, FiEyeOff } from "react-icons/fi";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    symbol: false,
  });

  const [showRules, setShowRules] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const isStrongPassword = (password) => {
    const pattern = /^(?=.*[A-Z])(?=.*[\W_]).{8,}$/;
    return pattern.test(password);
  };

  const evaluatePassword = (password) => {
    setPasswordStrength({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      symbol: /[\W_]/.test(password),
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
    setMessage("");
  };

  const togglePassword = () => setShowPassword((prev) => !prev);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setShowRules(false);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!isStrongPassword(formData.password)) {
      evaluatePassword(formData.password);
      setShowRules(true);
      setError("Password does not meet the strength requirements.");
      return;
    }

    try {
      await axios.post("/register", formData);
      setMessage("Registered successfully. Please login.");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.response?.data?.msg || "Registration failed.");
    }
  };

  return (
    <div className="auth-container">
      <h2>Register</h2>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label>Last Name</label>
        <input name="name" type="text" onChange={handleChange} required />

        <label>Email</label>
        <input name="email" type="email" onChange={handleChange} required />

        <label>Password</label>
        <div className="password-wrapper">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            onChange={handleChange}
            required
          />
          <span onClick={togglePassword} className="password-toggle">
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </span>
        </div>

        {showRules && (
          <div className="password-rules-box">
            <p className={passwordStrength.length ? "valid" : "invalid"}>
              {passwordStrength.length ? "✔" : "✖"} At least 8 characters
            </p>
            <p className={passwordStrength.uppercase ? "valid" : "invalid"}>
              {passwordStrength.uppercase ? "✔" : "✖"} Contains an uppercase letter
            </p>
            <p className={passwordStrength.symbol ? "valid" : "invalid"}>
              {passwordStrength.symbol ? "✔" : "✖"} Contains a symbol (e.g. !@#%)
            </p>
          </div>
        )}

        <label>Confirm Password</label>
        <div className="password-wrapper">
          <input
            name="confirmPassword"
            type={showPassword ? "text" : "password"}
            onChange={handleChange}
            required
          />
          <span onClick={togglePassword} className="password-toggle">
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </span>
        </div>

        {error && <p className="auth-error">{error}</p>}
        {message && <p className="auth-success">{message}</p>}

        <button className="auth-btn" type="submit">Register</button>
      </form>

      <div className="auth-footer">
        Already have an account?{" "}
        <Link to="/login" className="auth-switch-link">Login</Link>
      </div>
    </div>
  );
}
