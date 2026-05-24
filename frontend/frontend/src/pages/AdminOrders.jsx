import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";

const API = "http://127.0.0.1:8000/api";

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [agents, setAgents] = useState([]);
  const [report, setReport] = useState(null);
  const [agentInputs, setAgentInputs] = useState({});
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const authHeader = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    const role = localStorage.getItem("role");

    if (!token) {
      alert("Please login ❌");
      navigate("/");
      return;
    }

    if (role?.toUpperCase() !== "ADMIN") {
      alert("Admin only ❌");
      navigate("/customer");
      return;
    }

    fetchOrders();
    fetchReport();
    fetchAgents();
  }, []);

  // 📦 FETCH ORDERS
  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API}/orders/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data);
    } catch (err) {
      console.error("Orders error:", err.response?.data);
    }
  };

  // 📊 FETCH REPORT
  const fetchReport = async () => {
    try {
      const res = await axios.get(`${API}/orders/report/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReport(res.data);
    } catch (err) {
      console.error("Report error:", err.response?.data);
    }
  };

  // 👨‍✈️ FETCH AGENTS
  const fetchAgents = async () => {
    try {
      const res = await axios.get(`${API}/agents/`, { headers: authHeader });
      setAgents(res.data);
    } catch (err) {
      console.error("Agents error:", err.response?.data);
    }
  };

  // 👨‍✈️ ASSIGN AGENT
  const assignAgent = async (orderId) => {
    const agentId = parseInt(agentInputs[orderId]);

    if (!agentId) return alert("Enter valid Agent ID");

    try {
      await axios.post(
        `${API}/orders/${orderId}/assign/`,
        { agent_id: agentId },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      fetchOrders();
    } catch (err) {
      console.error("Assign error:", err.response?.data);
      alert(err.response?.data?.error || "Assign failed ❌");
    }
  };

  // 📦 UPDATE STATUS
  const updateStatus = async (orderId, status) => {
    try {
      const cleanStatus = status.toUpperCase().trim();
      await axios.post(
        `${API}/orders/${orderId}/status/`,
        { status: cleanStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      fetchOrders();
      fetchReport();
    } catch (err) {
      alert(err.response?.data?.error || "Update failed ❌");
    }
  };

  // 🗑 DELETE
  const deleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;

    try {
      await axios.delete(`${API}/orders/${orderId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchOrders();
      fetchReport();
    } catch (err) {
      alert("Delete failed ❌");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING": return "status-warning";
      case "ASSIGNED": return "status-info";
      case "ACCEPTED": return "status-primary";
      case "DELIVERING": return "status-orange";
      case "DELIVERED": return "status-success";
      default: return "status-default";
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesTab = activeTab === "all" || 
                      (activeTab === "active" && order.status !== "DELIVERED") || 
                      (activeTab === "completed" && order.status === "DELIVERED");
                      
    const matchesSearch = order.item?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          order.id.toString().includes(searchQuery);
                          
    return matchesTab && matchesSearch;
  });

  return (
    <div className="admin-page-wrapper">
      <Navbar />

      <div className="admin-dashboard container animate-fade-in">
        <div className="admin-header">
          <div>
            <h1>Control Center</h1>
            <p className="subtitle">System Overview & Management</p>
          </div>
          <div className="admin-controls">
            <button className="refresh-btn" onClick={() => {fetchOrders(); fetchReport();}}>
              ↻ Refresh Data
            </button>
          </div>
        </div>

        {/* 📊 ANALYTICS */}
        {report && (
          <div className="analytics-grid">
            <div className="analytics-card premium-card animate-slide-up" style={{animationDelay: '0.1s'}}>
              <div className="analytics-icon blue">📦</div>
              <div className="analytics-info">
                <h3>Total Orders</h3>
                <p className="analytics-value">{report.total_orders}</p>
              </div>
            </div>

            <div className="analytics-card premium-card animate-slide-up" style={{animationDelay: '0.2s'}}>
              <div className="analytics-icon green">✅</div>
              <div className="analytics-info">
                <h3>Delivered</h3>
                <p className="analytics-value">{report.delivered_orders}</p>
              </div>
            </div>

            <div className="analytics-card premium-card animate-slide-up" style={{animationDelay: '0.3s'}}>
              <div className="analytics-icon orange">📈</div>
              <div className="analytics-info">
                <h3>Success Rate</h3>
                <p className="analytics-value">{report.success_rate}%</p>
              </div>
            </div>

            <div className="analytics-card premium-card animate-slide-up" style={{animationDelay: '0.4s'}}>
              <div className="analytics-icon purple">⏱</div>
              <div className="analytics-info">
                <h3>Avg Time</h3>
                <p className="analytics-value">{report.average_delivery_time}</p>
              </div>
            </div>
          </div>
        )}

        <div className="orders-management-section premium-card">
          <div className="section-toolbar">
            <div className="tabs-container">
              <button 
                className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                All Orders
              </button>
              <button 
                className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
                onClick={() => setActiveTab('active')}
              >
                Active
              </button>
              <button 
                className={`tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
                onClick={() => setActiveTab('completed')}
              >
                Completed
              </button>
            </div>
            
            <div className="search-bar">
              <span className="search-icon">🔍</span>
              <input 
                type="text" 
                placeholder="Search orders..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="orders-table-wrapper">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Item Details</th>
                  <th>Status</th>
                  <th>Delivery Agent</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="empty-table">No orders found matching your criteria.</td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const canDeliver = order.status === "ASSIGNED" || order.status === "ACCEPTED";
                    const canComplete = order.status === "DELIVERING";
                    
                    return (
                      <tr key={order.id} className="animate-fade-in">
                        <td className="fw-bold">#{order.id}</td>
                        <td>
                          <div className="item-details">
                            <span className="item-name">{order.item}</span>
                            <span className="item-shop">{order.shop_name}</span>
                          </div>
                        </td>
                        <td>
                          <span className={`status-badge ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td>
                          <div className="agent-assignment">
                            {order.delivery_agent ? (
                              <span className="agent-name">ID: {order.delivery_agent}</span>
                            ) : (
                              <div className="assign-input-group">
                                <select
                                  value={agentInputs[order.id] || ""}
                                  onChange={(e) =>
                                    setAgentInputs({
                                      ...agentInputs,
                                      [order.id]: e.target.value,
                                    })
                                  }
                                  className="agent-select"
                                  style={{ padding: '8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', flex: 1 }}
                                >
                                  <option value="">Select Agent...</option>
                                  {agents.map(a => (
                                    <option key={a.id} value={a.id}>{a.username} (ID: {a.id})</option>
                                  ))}
                                </select>
                                <button
                                  className="assign-btn"
                                  onClick={() => assignAgent(order.id)}
                                >
                                  Assign
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="action-buttons">
                            {order.status !== "DELIVERED" && (
                              <button
                                onClick={() => navigate(`/tracking/${order.id}`)}
                                className="icon-btn track"
                                title="Track Order"
                              >
                                📍
                              </button>
                            )}
                            
                            <button
                              onClick={() => updateStatus(order.id, "DELIVERING")}
                              disabled={!canDeliver}
                              className="icon-btn start"
                              title="Force Delivery"
                              style={{ opacity: canDeliver ? 1 : 0.2 }}
                            >
                              🚚
                            </button>

                            <button
                              onClick={() => updateStatus(order.id, "DELIVERED")}
                              disabled={!canComplete}
                              className="icon-btn complete"
                              title="Force Complete"
                              style={{ opacity: canComplete ? 1 : 0.2 }}
                            >
                              ✅
                            </button>

                            <button
                              onClick={() => deleteOrder(order.id)}
                              className="icon-btn delete"
                              title="Delete Order"
                            >
                              🗑
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminOrders;

/* 🎨 ADMIN CSS */
const styles = `
.admin-page-wrapper {
  min-height: 100vh;
  background-color: var(--bg-main);
  padding-bottom: 3rem;
}

.admin-dashboard {
  padding-top: 2rem;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 2rem;
}

.admin-header h1 {
  font-size: 2.2rem;
  color: var(--text-primary);
  margin-bottom: 0.2rem;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 1.1rem;
}

.refresh-btn {
  background: white;
  border: 1px solid var(--border-medium);
  padding: 0.75rem 1.25rem;
  border-radius: var(--radius-sm);
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.refresh-btn:hover {
  background: var(--bg-main);
  border-color: var(--text-primary);
}

/* Analytics */
.analytics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.analytics-card {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  transition: transform 0.2s;
}

.analytics-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
}

.analytics-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
}

.analytics-icon.blue { background: #e0f2fe; color: #0284c7; }
.analytics-icon.green { background: #dcfce3; color: #16a34a; }
.analytics-icon.orange { background: #ffedd5; color: #ea580c; }
.analytics-icon.purple { background: #f3e8ff; color: #9333ea; }

.analytics-info h3 {
  font-size: 0.9rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.2rem;
}

.analytics-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--text-primary);
}

/* Table Section */
.orders-management-section {
  padding: 0;
  overflow: hidden;
}

.section-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-light);
  background: #f8fafc;
}

.tabs-container {
  display: flex;
  gap: 0.5rem;
}

.tab-btn {
  padding: 0.6rem 1.2rem;
  border-radius: var(--radius-full);
  font-weight: 600;
  color: var(--text-secondary);
  background: transparent;
}

.tab-btn.active {
  background: var(--brand-dark);
  color: white;
}

.search-bar {
  display: flex;
  align-items: center;
  background: white;
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-full);
  padding: 0.5rem 1rem;
  width: 300px;
}

.search-bar input {
  border: none;
  outline: none;
  width: 100%;
  padding-left: 0.5rem;
  font-size: 0.9rem;
  background: transparent;
  color: #1e1e1e;
}

/* Table */
.orders-table-wrapper {
  overflow-x: auto;
}

.orders-table {
  width: 100%;
  border-collapse: collapse;
}

.orders-table th {
  text-align: left;
  padding: 1rem 1.5rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 0.5px;
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-medium);
}

.orders-table td {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-light);
  vertical-align: middle;
}

.orders-table tr:last-child td {
  border-bottom: none;
}

.orders-table tr:hover {
  background: #f8fafc;
}

.fw-bold {
  font-weight: 600;
  color: var(--text-primary);
}

.item-details {
  display: flex;
  flex-direction: column;
}

.item-name {
  font-weight: 600;
  color: var(--text-primary);
}

.item-shop {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

/* Status Badges */
.status-badge {
  padding: 0.35rem 0.75rem;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  display: inline-block;
}

.status-warning { background: #fef3c7; color: #d97706; }
.status-info { background: #dbeafe; color: #2563eb; }
.status-primary { background: #ede9fe; color: #7c3aed; }
.status-orange { background: #ffedd5; color: #ea580c; }
.status-success { background: #dcfce3; color: #16a34a; }
.status-default { background: #f1f5f9; color: #64748b; }

/* Assignments */
.agent-name {
  font-weight: 600;
  color: #0f172a;
  background: #f1f5f9;
  padding: 0.4rem 0.8rem;
  border-radius: var(--radius-sm);
  display: inline-block;
}

.assign-input-group {
  display: flex;
  gap: 0.5rem;
}

.assign-input-group input {
  width: 80px;
  padding: 0.5rem;
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  background: #ffffff;
  color: #1e1e1e;
}

.assign-btn {
  background: var(--brand-dark);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-sm);
  font-weight: 600;
  font-size: 0.85rem;
}

.assign-btn:hover { background: #333; }

/* Actions */
.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.icon-btn {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  transition: all 0.2s;
  background: white;
  border: 1px solid var(--border-medium);
}

.icon-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

.icon-btn:disabled {
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.icon-btn.track { border-color: #3b82f6; color: #3b82f6; }
.icon-btn.start { border-color: #f59e0b; color: #f59e0b; }
.icon-btn.complete { border-color: #10b981; color: #10b981; }
.icon-btn.delete { border-color: #ef4444; color: #ef4444; }

.empty-table {
  text-align: center;
  padding: 3rem !important;
  color: var(--text-secondary);
  font-style: italic;
}
`;

if (typeof document !== "undefined") {
  const styleTag = document.createElement("style");
  styleTag.innerHTML = styles;
  document.head.appendChild(styleTag);
}
