import { useState } from "react";
import TrackShipment from "./pages/TrackShipment";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CreateShipment from "./pages/CreateShipment";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [view, setView] = useState("track");

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setView("dashboard");
  };

  const navBtn = (key) => `nav-btn ${view === key ? "active" : ""}`;

  return (
    <div>
      <nav className="navbar">
        <span className="brand">SwiftTrack</span>
        <button className={navBtn("track")} onClick={() => setView("track")}>
          Track Shipment
        </button>
        {!isLoggedIn && (
          <button className={navBtn("login")} onClick={() => setView("login")}>
            Admin Login
          </button>
        )}
        {isLoggedIn && (
          <>
            <button className={navBtn("dashboard")} onClick={() => setView("dashboard")}>
              Dashboard
            </button>
            <button className={navBtn("create")} onClick={() => setView("create")}>
              Create Shipment
            </button>
            <button
              className="nav-btn logout"
              onClick={() => {
                localStorage.removeItem("token");
                setIsLoggedIn(false);
                setView("track");
              }}
            >
              Logout
            </button>
          </>
        )}
      </nav>

      {view === "track" && <TrackShipment />}
      {view === "login" && <Login onLoginSuccess={handleLoginSuccess} />}
      {view === "dashboard" && <Dashboard />}
      {view === "create" && <CreateShipment />}
    </div>
  );
}

export default App;