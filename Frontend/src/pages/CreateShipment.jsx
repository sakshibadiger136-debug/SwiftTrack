import { useState } from "react";
import API from "../api/axios";

function CreateShipment() {
  const [form, setForm] = useState({
    senderName: "",
    senderPhone: "",
    senderAddress: "",
    receiverName: "",
    receiverPhone: "",
    receiverAddress: "",
    estimatedDelivery: "",
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setError("");
    setResult(null);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        sender: {
          name: form.senderName,
          phone: form.senderPhone,
          address: form.senderAddress,
        },
        receiver: {
          name: form.receiverName,
          phone: form.receiverPhone,
          address: form.receiverAddress,
        },
        estimatedDelivery: form.estimatedDelivery,
      };
      const res = await API.post("/shipments", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setResult(res.data);
      setForm({
        senderName: "",
        senderPhone: "",
        senderAddress: "",
        receiverName: "",
        receiverPhone: "",
        receiverAddress: "",
        estimatedDelivery: "",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create shipment");
    }
  };

  return (
    <div className="page">
      <span className="eyebrow">New Manifest</span>
      <h2 className="page-title">Create shipment</h2>

      <div className="form-card">
        <label className="field-label">Sender name</label>
        <input name="senderName" placeholder="Full name" value={form.senderName} onChange={handleChange} />

        <label className="field-label">Sender phone</label>
        <input name="senderPhone" placeholder="10-digit number" value={form.senderPhone} onChange={handleChange} />

        <label className="field-label">Sender address</label>
        <input name="senderAddress" placeholder="City, State" value={form.senderAddress} onChange={handleChange} />

        <label className="field-label">Receiver name</label>
        <input name="receiverName" placeholder="Full name" value={form.receiverName} onChange={handleChange} />

        <label className="field-label">Receiver phone</label>
        <input name="receiverPhone" placeholder="10-digit number" value={form.receiverPhone} onChange={handleChange} />

        <label className="field-label">Receiver address</label>
        <input name="receiverAddress" placeholder="City, State" value={form.receiverAddress} onChange={handleChange} />

        <label className="field-label">Estimated delivery</label>
        <input type="date" name="estimatedDelivery" value={form.estimatedDelivery} onChange={handleChange} />

        <button className="btn btn-primary btn-block" onClick={handleSubmit}>
          Create shipment
        </button>

        {error && <p className="msg-error">{error}</p>}
        {result && (
          <div className="msg-success">
            <div className="success-title">Shipment created</div>
            <span className="manifest-id">{result.trackingId}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default CreateShipment;