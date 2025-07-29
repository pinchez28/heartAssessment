import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [form, setForm] = useState({
    Age: "30",
    RestingBP: "120",
    Cholesterol: "180",
    MaxHR: "140",
    Oldpeak: "0.0",
    Sex: "F",
    ChestPainType: "ATA",
    RestingECG: "Normal",
    ExerciseAngina: "N",
    ST_Slope: "Up",
    FastingBS: "0"
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const token = sessionStorage.getItem("access_token");
    if (!token) {
      alert("Session expired. Please log in again.");
      return;
    }

    const res = await axios.post(
      "http://localhost:5050/api/analyze",
      form,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    navigate("/analysis", { state: res.data });
  } catch (error) {
    if (error.response?.status === 401) {
      alert("Unauthorized: Session expired or invalid. Please log in again.");
    } else {
      alert("Prediction failed: " + (error.response?.data?.error || error.message));
    }
  }
};

  return (
    <div className="container page-content">
      <div className="card">
        <h2 className="text-center section-title">Heart Disease Risk Assessment</h2>
        <form onSubmit={handleSubmit} className="form-grid-3col">
          {[
            {
              name: "Age",
              type: "number",
              min: 18,
              max: 100,
              note: "Typical adult screening age range"
            },
            {
              name: "RestingBP",
              type: "number",
              min: 70,
              max: 200,
              note: "Normal: ~120/80 mmHg"
            },
            {
              name: "Cholesterol",
              type: "number",
              min: 100,
              max: 600,
              note: "Desirable: <200 mg/dL"
            },
            {
              name: "MaxHR",
              type: "number",
              min: 60,
              max: 220,
              note: "Depends on age"
            },
            {
              name: "Oldpeak",
              type: "number",
              min: 0,
              max: 6,
              step: 0.1,
              note: "ST depression in mm"
            }
          ].map((field) => (
            <div className="form-group" key={field.name}>
              <label htmlFor={field.name}>{field.name}</label>
              <input
                name={field.name}
                type={field.type}
                value={form[field.name]}
                min={field.min}
                max={field.max}
                step={field.step || "any"}
                onChange={handleChange}
                required
              />
            </div>
          ))}

          <div className="form-group">
            <label htmlFor="FastingBS">Fasting Blood Sugar ≥ 120 mg/dL</label>
            <select
              name="FastingBS"
              value={form.FastingBS}
              onChange={handleChange}
              required
            >
              <option value="">Select</option>
              <option value="1">Yes (≥ 120 mg/dL)</option>
              <option value="0">No (&lt; 120 mg/dL)</option>
            </select>
          </div>
            {/* Categorical Inputs */}
          {[
            { name: "Sex", options: ["M", "F"] },
            { name: "ChestPainType", options: ["TA", "ATA", "NAP", "ASY"] },
            { name: "RestingECG", options: ["Normal", "ST", "LVH"] },
            { name: "ExerciseAngina", options: ["Y", "N"] },
            { name: "ST_Slope", options: ["Up", "Flat", "Down"] }
          ].map((field) => (
            <div className="form-group" key={field.name}>
              <label htmlFor={field.name}>{field.name}</label>
              <select
                name={field.name}
                value={form[field.name]}
                onChange={handleChange}
                required
              >
                <option value="">Select {field.name}</option>
                {field.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          ))}

          <div className="form-group" style={{ gridColumn: "1 / -1" }}>
            <button type="submit" className="stretch-btn">
              Predict
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Dashboard;
