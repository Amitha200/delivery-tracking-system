import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
      navigate("/", { replace: true });
      return;
    }

    if (role) {
      const r = role.toUpperCase().trim();
      if (r === "ADMIN") navigate("/admin");
      else if (r === "AGENT") navigate("/agent");
      else navigate("/customer");
    }
  }, [navigate]);

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
        <div style={{ textAlign: 'center', padding: '3rem', background: 'white', borderRadius: '16px', boxShadow: 'var(--shadow-md)' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔄</div>
          <h2>Redirecting to your dashboard...</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Please wait while we set things up.</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;