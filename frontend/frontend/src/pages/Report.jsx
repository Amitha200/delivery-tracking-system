import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

function Reports() {
  const [adminData, setAdminData] = useState(null);
  const [agentData, setAgentData] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const adminRes = await axios.get(
        "http://127.0.0.1:8000/api/reports/admin-report/",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const agentRes = await axios.get(
        "http://127.0.0.1:8000/api/reports/agent-report/",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setAdminData(adminRes.data);
      setAgentData(agentRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (!adminData) return (
    <div className="page-wrapper">
      <Navbar />
      <div className="container" style={{display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh'}}>
        <div className="spinner"></div>
      </div>
    </div>
  );

  return (
    <div className="report-page-wrapper">
      <Navbar />
      
      <div className="container animate-fade-in" style={{paddingTop: '2rem'}}>
        <div className="report-header">
          <h1>📊 System Performance Report</h1>
          <p className="subtitle">Real-time metrics and analytics overview</p>
        </div>

        {/* ================= ADMIN STATS ================= */}
        <div className="report-section">
          <h2>Platform Overview</h2>
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="icon bg-blue">📦</div>
              <div className="info">
                <span className="value">{adminData.total_orders}</span>
                <span className="label">Total Orders</span>
              </div>
            </div>
            
            <div className="metric-card">
              <div className="icon bg-green">✅</div>
              <div className="info">
                <span className="value">{adminData.delivered_orders}</span>
                <span className="label">Delivered Orders</span>
              </div>
            </div>

            <div className="metric-card">
              <div className="icon bg-orange">📈</div>
              <div className="info">
                <span className="value">{adminData.success_rate}%</span>
                <span className="label">Success Rate</span>
              </div>
            </div>

            <div className="metric-card">
              <div className="icon bg-purple">⏱</div>
              <div className="info">
                <span className="value">{adminData.average_delivery_time_minutes} <span style={{fontSize: '1rem'}}>mins</span></span>
                <span className="label">Avg Delivery Time</span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= AGENT REPORT ================= */}
        <div className="report-section" style={{marginTop: '3rem'}}>
          <h2>🚚 Agent Performance</h2>
          
          <div className="agent-grid">
            {agentData.length === 0 ? (
              <div className="empty-state">No agent data available</div>
            ) : (
              agentData.map((agent, index) => (
                <div key={index} className="agent-card animate-slide-up" style={{animationDelay: `${index * 0.1}s`}}>
                  <div className="agent-avatar">
                    {agent.agent.charAt(0).toUpperCase()}
                  </div>
                  <div className="agent-details">
                    <h3>{agent.agent}</h3>
                    <div className="agent-stats">
                      <div className="stat">
                        <span className="stat-val">{agent.total_orders}</span>
                        <span className="stat-lbl">Total</span>
                      </div>
                      <div className="stat">
                        <span className="stat-val text-green">{agent.delivered_orders}</span>
                        <span className="stat-lbl">Delivered</span>
                      </div>
                      <div className="stat">
                        <span className="stat-val">{agent.average_time}m</span>
                        <span className="stat-lbl">Avg Time</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;

/* 🎨 REPORT CSS */
const styles = `
.report-page-wrapper {
  min-height: 100vh;
  background-color: var(--bg-main);
  padding-bottom: 3rem;
}

.report-header {
  margin-bottom: 2rem;
  border-bottom: 1px solid var(--border-medium);
  padding-bottom: 1rem;
}

.report-header h1 {
  font-size: 2rem;
  margin-bottom: 0.2rem;
}

.report-section h2 {
  font-size: 1.3rem;
  margin-bottom: 1.5rem;
  color: var(--text-secondary);
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
}

.metric-card {
  background: white;
  padding: 1.5rem;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: center;
  gap: 1.2rem;
  border: 1px solid var(--border-light);
}

.metric-card .icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.bg-blue { background: #e0f2fe; color: #0284c7; }
.bg-green { background: #dcfce3; color: #16a34a; }
.bg-orange { background: #ffedd5; color: #ea580c; }
.bg-purple { background: #f3e8ff; color: #9333ea; }

.metric-card .info {
  display: flex;
  flex-direction: column;
}

.metric-card .value {
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--text-primary);
  line-height: 1.2;
}

.metric-card .label {
  font-size: 0.85rem;
  color: var(--text-secondary);
  font-weight: 600;
  text-transform: uppercase;
}

.agent-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.agent-card {
  background: white;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
  display: flex;
  align-items: center;
  padding: 1.5rem;
  gap: 1.2rem;
}

.agent-avatar {
  width: 60px;
  height: 60px;
  background: var(--brand-dark);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
}

.agent-details {
  flex: 1;
}

.agent-details h3 {
  margin: 0 0 0.8rem 0;
  font-size: 1.1rem;
}

.agent-stats {
  display: flex;
  justify-content: space-between;
  background: var(--bg-main);
  padding: 0.8rem;
  border-radius: var(--radius-sm);
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
}

.stat-val {
  font-weight: 700;
  font-size: 1rem;
}

.stat-lbl {
  font-size: 0.7rem;
  color: var(--text-secondary);
  text-transform: uppercase;
}

.text-green {
  color: #16a34a;
}
`;

if (typeof document !== "undefined") {
  const styleTag = document.createElement("style");
  styleTag.innerHTML = styles;
  document.head.appendChild(styleTag);
}