import { useState } from "react";
import API from "../api/axios";

const statusClass = (status) => `status-badge status-${status.replace(/\s+/g, "-")}`;
const CORRECTABLE_STATUSES = ["Order Placed", "Picked Up"];

function TrackShipment() {
  const [trackingId, setTrackingId] = useState("");
  const [shipment, setShipment] = useState(null);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [newAddress, setNewAddress] = useState("");
  const [reason, setReason] = useState("");
  const [reqMsg, setReqMsg] = useState("");

  const handleTrack = async () => {
    setError("");
    setShipment(null);
    setReqMsg("");
    try {
      const res = await API.get(`/shipments/${trackingId}`);
      setShipment(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Shipment not found");
    }
  };

  const handleRequestCorrection = async () => {
    setReqMsg("");
    try {
      const res = await API.post(`/shipments/${shipment.trackingId}/request-correction`, {
        newAddress,
        reason,
      });
      setReqMsg("Correction request submitted — awaiting admin review.");
      setShipment(res.data.shipment);
      setShowForm(false);
    } catch (err) {
      setReqMsg(err.response?.data?.message || "Failed to submit request");
    }
  };

  return (
    <div className="page">
      <span className="eyebrow">Shipment Lookup</span>
      <h2 className="page-title">Track your shipment</h2>

      <div className="search-row">
        <input
          type="text"
          placeholder="Enter Tracking ID"
          value={trackingId}
          onChange={(e) => setTrackingId(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleTrack()}
        />
        <button className="btn btn-primary" onClick={handleTrack}>
          Track
        </button>
      </div>

      {error && <p className="msg-error">{error}</p>}

      {shipment && (
        <div className="summary-card">
          <div className="summary-row">
            <span className="manifest-id">{shipment.trackingId}</span>
            <span className={statusClass(shipment.currentStatus)}>
              {shipment.currentStatus}
            </span>
          </div>

          <div className="route-line">
            <strong>{shipment.sender.name}</strong>
            <span className="route-arrow">→</span>
            <strong>{shipment.receiver.name}</strong>
          </div>

          <ul className="timeline">
            {shipment.statusHistory.map((entry, idx) => (
              <li className="timeline-item" key={idx}>
                <div className="timeline-status">{entry.status}</div>
                <div className="timeline-meta">
                  {entry.location} · {new Date(entry.timestamp).toLocaleString()}
                  {entry.note && ` · ${entry.note}`}
                </div>
              </li>
            ))}
          </ul>

          {CORRECTABLE_STATUSES.includes(shipment.currentStatus) && (
            <div style={{ marginTop: "1.5rem", borderTop: "1px solid var(--border)", paddingTop: "1rem" }}>
              {shipment.correctionRequest?.status === "pending" ? (
                <p className="msg-success">
                  ⏳ Address correction pending admin review — requested: {shipment.correctionRequest.newAddress}
                </p>
              ) : !showForm ? (
                <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                  Wrong delivery address? Request correction
                </button>
              ) : (
                <div className="form-card">
                  <label className="field-label">Correct receiver address</label>
                  <input
                    placeholder="City, State"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                  />
                  <label className="field-label">Reason</label>
                  <input
                    placeholder="e.g., Typed wrong city"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                  <button className="btn btn-primary btn-block" onClick={handleRequestCorrection}>
                    Submit correction request
                  </button>
                </div>
              )}
              {reqMsg && <p className="msg-error">{reqMsg}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default TrackShipment;