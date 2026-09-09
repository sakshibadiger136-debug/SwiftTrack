import { useEffect, useState } from "react";
import API from "../api/axios";

const STATUS_OPTIONS = ["Order Placed", "Picked Up", "In Transit", "Out for Delivery", "Delivered"];
const statusClass = (status) => `status-badge status-${status.replace(/\s+/g, "-")}`;

function Dashboard() {
  const [shipments, setShipments] = useState([]);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState({});

  const [corrections, setCorrections] = useState([]);
  const [remarksMap, setRemarksMap] = useState({});

  const fetchShipments = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await API.get("/shipments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShipments(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load shipments");
    }
  };

  const fetchCorrections = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await API.get("/shipments/admin/correction-requests", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCorrections(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchShipments();
    fetchCorrections();
  }, []);

  const handleStatusChange = (trackingId, field, value) => {
    setUpdating((prev) => ({
      ...prev,
      [trackingId]: { ...prev[trackingId], [field]: value },
    }));
  };

  const handleUpdate = async (trackingId) => {
    const update = updating[trackingId];
    if (!update || !update.status) {
      alert("Please select a status");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      await API.patch(
        `/shipments/${trackingId}/status`,
        {
          status: update.status,
          location: update.location || "",
          note: update.note || "",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchShipments();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status");
    }
  };

  const handleReview = async (trackingId, decision) => {
    try {
      const token = localStorage.getItem("token");
      await API.put(
        `/shipments/${trackingId}/review-correction`,
        { decision, adminRemarks: remarksMap[trackingId] || "" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchCorrections();
      fetchShipments();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to review request");
    }
  };

  return (
    <div className="page-wide">
      <span className="eyebrow">Admin Panel</span>
      <h2 className="page-title">All shipments</h2>

      {corrections.length > 0 && (
        <div style={{ marginBottom: "2rem" }}>
          <h3 style={{ color: "var(--accent)", marginBottom: "1rem" }}>
            Address Correction Requests ({corrections.length})
          </h3>
          {corrections.map((s) => (
            <div className="shipment-card" key={s._id}>
              <div className="shipment-card-header">
                <span className="tracking-id-inline">{s.trackingId}</span>
              </div>
              <p><strong>Current:</strong> {s.receiver.address}</p>
              <p><strong>Requested:</strong> {s.correctionRequest.newAddress}</p>
              <p><strong>Reason:</strong> {s.correctionRequest.reason}</p>
              <div className="update-row">
                <input
                  placeholder="Admin remarks (optional)"
                  onChange={(e) =>
                    setRemarksMap({ ...remarksMap, [s.trackingId]: e.target.value })
                  }
                />
                <button className="btn btn-primary" onClick={() => handleReview(s.trackingId, "approved")}>
                  Approve
                </button>
                <button className="btn" onClick={() => handleReview(s.trackingId, "rejected")}>
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && <p className="msg-error">{error}</p>}
      {shipments.length === 0 && !error && (
        <p className="empty-state">No shipments yet. Create one to get started.</p>
      )}

      {shipments.map((s) => (
        <div className="shipment-card" key={s._id}>
          <div className="shipment-card-header">
            <span className="tracking-id-inline">{s.trackingId}</span>
            <span className={statusClass(s.currentStatus)}>{s.currentStatus}</span>
          </div>

          <div className="route-line" style={{ margin: 0 }}>
            <strong>{s.sender.name}</strong>
            <span className="route-arrow">→</span>
            <strong>{s.receiver.name}</strong>
          </div>

          <div className="update-row">
            <select
              onChange={(e) => handleStatusChange(s.trackingId, "status", e.target.value)}
              defaultValue=""
            >
              <option value="" disabled>Update status…</option>
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>

            <input
              placeholder="Location"
              onChange={(e) => handleStatusChange(s.trackingId, "location", e.target.value)}
            />

            <input
              placeholder="Note (optional)"
              onChange={(e) => handleStatusChange(s.trackingId, "note", e.target.value)}
            />

            <button className="btn btn-primary" onClick={() => handleUpdate(s.trackingId)}>
              Update
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Dashboard;