import React, { useRef } from "react";
import { useLocation } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function Analysis() {
  const location = useLocation();
  const result = location.state;
  const reportRef = useRef();

  if (!result) {
    return <p>No analysis data available.</p>;
  }

  const {
    prediction,
    confidence,
    features = [],
    input: input = {},
    baseline = {},
  } = result;

  const numericFeatures = [
    "Age",
    "RestingBP",
    "Cholesterol",
    "MaxHR",
    "Oldpeak",
    "FastingBS",
  ];

  const data = numericFeatures.map((feature) => ({
    feature,
    userInput: parseFloat(input[feature]) || 0,
    healthyBaseline: parseFloat(baseline[feature]) || 0,
  }));

  const diffs = data.map((item) => ({
    feature: item.feature,
    diff: Math.abs(item.userInput - item.healthyBaseline),
  }));
  const totalDiff = diffs.reduce((sum, item) => sum + item.diff, 0);
  const contributingFactors = diffs
    .map((item) => ({
      feature: item.feature,
      percentage: totalDiff ? ((item.diff / totalDiff) * 100).toFixed(1) : 0,
    }))
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 5);

  const suggestions =
    prediction === "High Risk"
      ? [
          "Consider further evaluation.",
          "Adopt a heart-healthy diet low in saturated fats and cholesterol.",
          "Increase regular physical activity (with doctor's approval).",
          "Manage stress and monitor blood pressure regularly.",
        ]
      : [
          "Maintain your current healthy lifestyle.",
          "Continue regular check-ups and preventive screenings.",
          "Stay physically active and eat a balanced diet.",
          "Monitor blood pressure, cholesterol, and blood sugar annually.",
        ];

  const downloadPDF = async () => {
    const element = reportRef.current;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`HeartHealth_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="container page-content">
      <div className="card" ref={reportRef}>
        <h2 className="text-center section-title">Prediction Result</h2>
        <p
          className={`prediction ${prediction === "High Risk" ? "high-risk" : "low-risk"}`}
          style={{ textAlign: "center", marginBottom: "0.5rem" }}
        >
          {prediction}
        </p>
        <p style={{ textAlign: "center", marginBottom: "2rem" }}>
          Confidence: {(confidence * 100).toFixed(2)}%
        </p>

        {prediction === "High Risk" && contributingFactors.length > 0 && (
          <div style={{ marginTop: "2rem" }}>
            <h3 className="section-title">Top Contributing Factors</h3>
            <ul>
              {contributingFactors.map((factor) => (
                <li key={factor.feature}>
                  {factor.feature}: {factor.percentage}%
                </li>
              ))}
            </ul>
          </div>
        )}

        {prediction === "High Risk" && features.length > 0 && (
          <div style={{ marginTop: "1.5rem", width: "100%", height: 400 }}>
            <ResponsiveContainer>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="feature" tick={{ fill: "#ffffff", fontWeight: "bold" }} />
                <YAxis tick={{ fill: "#ffffff", fontWeight: "bold" }} />
                <Tooltip contentStyle={{ backgroundColor: "#333", color: "#fff" }} />
                <Legend wrapperStyle={{ color: "#ffffff" }} />
                <Line
                  type="monotone"
                  dataKey="userInput"
                  stroke="#ff6384"
                  strokeWidth={3}
                  name="Your Values"
                />
                <Line
                  type="monotone"
                  dataKey="healthyBaseline"
                  stroke="#4fc3f7"
                  strokeWidth={3}
                  name="Healthy Baseline"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        <div style={{ marginTop: "2rem" }}>
          <h3 className="section-title">Medical Suggestions</h3>
          <ul>
            {suggestions.map((s, index) => (
              <li key={index}>{s}</li>
            ))}
          </ul>
        </div>
      </div>

      <div style={{ marginTop: "1rem", textAlign: "center" }}>
        <button onClick={downloadPDF} className="stretch-btn">
          Download PDF Report
        </button>
      </div>
    </div>
  );
}
