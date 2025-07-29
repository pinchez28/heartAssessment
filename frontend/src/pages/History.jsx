import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaTrash } from "react-icons/fa";

// Normal healthy ranges
const normalRanges = {
  Age: [20, 60],
  RestingBP: [80, 120],
  Cholesterol: [125, 200],
  MaxHR: [100, 170],
  Oldpeak: [0, 2],
  FastingBS: [0, 0],
};

const History = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);

  const fetchHistory = async () => {
    try {
      const token = sessionStorage.getItem("access_token");
      const res = await axios.get("http://localhost:5050/api/history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecords(res.data.records);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteRecord = async (recordId) => {
    const confirmed = window.confirm("Are you sure you want to delete this record?");
    if (!confirmed) return;

    try {
      const token = sessionStorage.getItem("access_token");
      await axios.delete(`http://localhost:5050/api/history/${recordId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updatedRecords = records.filter((r) => r._id !== recordId);
      setRecords(updatedRecords);

      if (updatedRecords.length === 0) {
        setFeedback({
          type: "success",
          message: "All records deleted. No prediction records yet.",
        });
      } else {
        setFeedback({ type: "success", message: "Record deleted successfully." });
      }
    } catch (err) {
      console.error("Delete failed:", err);
      setFeedback({
        type: "error",
        message: err.response?.data?.error || "Failed to delete record. Please try again.",
      });
      if (err.response?.status === 404) {
        fetchHistory();
      }
    } finally {
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const clearAllRecords = async () => {
    const confirmed = window.confirm("Are you sure you want to delete ALL records?");
    if (!confirmed) return;

    try {
      const token = sessionStorage.getItem("access_token");
      await axios.delete("http://localhost:5050/api/history", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecords([]);
      setFeedback({
        type: "success",
        message: "All records deleted. No prediction records yet.",
      });
    } catch (err) {
      console.error("Failed to clear all records:", err);
      setFeedback({
        type: "error",
        message: err.response?.data?.error || "Failed to delete all records. Please try again.",
      });
    } finally {
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const isAbnormal = (key, value) => {
    if (!(key in normalRanges)) return false;
    const [min, max] = normalRanges[key];
    return value < min || value > max;
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  if (loading) return <p>Loading history...</p>;
  if (!records.length)
    return (
      <div className="container page-content">
        {feedback && (
          <div className={`feedback-message ${feedback.type}`}>
            {feedback.message}
          </div>
        )}
        <p>No prediction records yet.</p>
      </div>
    );

  return (
    <div className="container page-content">
      <div className="card">
        <h2 className="text-center section-title">Prediction History</h2>

        {feedback && (
          <div className={`feedback-message ${feedback.type}`}>
            {feedback.message}
          </div>
        )}

        <div className="history-list">
          {records.map((record) => (
            <div key={record._id} className="history-row">
              {/* Left column: prediction details */}
              <div className="history-info">
                <div
                  className={`prediction ${
                    record.prediction === "High Risk" ? "high-risk" : "low-risk"
                  }`}
                >
                  {record.prediction}
                </div>
                <div className="confidence">
                  Confidence: {(record.confidence * 100).toFixed(2)}%
                </div>
                <div className="timestamp">
                  {new Date(record.created_at).toUTCString()}
                </div>
              </div>

              {/* Right column: inputs */}
              <div className="history-inputs">
                {record.features?.map((key) => {
                  const value = record.input?.[key] ?? "N/A";
                  const isHigh = record.prediction === "High Risk";
                  const abnormal = isHigh && isAbnormal(key, Number(value));
                  return (
                    <div
                      key={key}
                      className={`input-item ${abnormal ? "abnormal" : ""}`}
                    >
                      <span className="input-key">{key}:</span> {value}
                    </div>
                  );
                })}
              </div>

              {/* Delete button */}
              <div
                className="delete-btn"
                title="Delete Record"
                onClick={() => deleteRecord(record._id)}
              >
                <FaTrash />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Clear All Button */}
      <div className="clear-all-container">
        <button onClick={clearAllRecords} className="clear-all-btn">
          Clear All Records
        </button>
      </div>
    </div>
  );
};

export default History;
