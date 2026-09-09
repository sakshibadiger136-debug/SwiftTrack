import { useState } from "react";
import API from "../api/axios";

function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    try {
      const res = await API.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("adminName", res.data.name);
      onLoginSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="page" style={{ maxWidth: "400px" }}>
      <span className="eyebrow">Staff Access</span>
      <h2 className="page-title">Admin login</h2>

      <div className="form-card">
        <label className="field-label">Email</label>
        <input
          type="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
        />

        <label className="field-label">Password</label>
        <input
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
        />

        <button className="btn btn-primary btn-block" onClick={handleLogin}>
          Log in
        </button>

        {error && <p className="msg-error">{error}</p>}
      </div>
    </div>
  );
}

export default Login;