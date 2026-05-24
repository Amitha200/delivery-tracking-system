import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

const API = "http://127.0.0.1:8000/api";

function AgentDashboard() {
  const [orders, setOrders] = useState([]);
  const [loadingId, setLoadingId] = useState(null);
  const [activeTab, setActiveTab] = useState("new"); // new, active, completed
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username") || "Agent";
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => {
    if (!token) {
      alert("Please login first ❌");
      navigate("/");
      return;
    }
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API}/orders/agent_orders/`, {
        headers: authHeader,
      });
      setOrders(res.data || []);
    } catch (err) {
      console.error("FETCH ERROR:", err.response?.data || err.message);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      setLoadingId(orderId);
      const formattedStatus = newStatus.toUpperCase().trim();
      
      await axios.post(
        `${API}/orders/${orderId}/status/`,
        { status: formattedStatus },
        { headers: authHeader }
      );
      fetchOrders();
    } catch (err) {
      const msg = err.response?.data?.error || "Status update failed";
      alert(msg);
    } finally {
      setLoadingId(null);
    }
  };

  const filterOrders = (tab) => {
    if (tab === "new") return orders.filter(o => o.status === "ASSIGNED" || o.status === "PENDING");
    if (tab === "active") return orders.filter(o => o.status === "ACCEPTED" || o.status === "DELIVERING");
    if (tab === "completed") return orders.filter(o => o.status === "DELIVERED");
    return orders;
  };

  const filteredOrders = filterOrders(activeTab);

  return (
    <div className="agent-page-wrapper">
      <Navbar />
      
      <div className="agent-dashboard container animate-fade-in">
        <div className="agent-header">
          <div className="agent-profile">
            <div className="agent-avatar">🛵</div>
            <div>
              <h1>Hello, {username} 👋</h1>
              <p className="subtitle"><span className="dot-green"></span> Delivery Partner Portal • Online</p>
            </div>
          </div>
          <div className="agent-stats">
            <div className="stat-box">
              <span className="stat-value">{filterOrders("completed").length}</span>
              <span className="stat-label">Delivered Today</span>
            </div>
            <div className="stat-box">
              <span className="stat-value">₹{filterOrders("completed").length * 50}</span>
              <span className="stat-label">Earnings</span>
            </div>
          </div>
        </div>

        <div className="tabs-container">
          <button 
            className={`tab-btn ${activeTab === 'new' ? 'active' : ''}`}
            onClick={() => setActiveTab('new')}
          >
            New Requests {filterOrders("new").length > 0 && <span className="badge">{filterOrders("new").length}</span>}
          </button>
          <button 
            className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
            onClick={() => setActiveTab('active')}
          >
            Active Deliveries
          </button>
          <button 
            className={`tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
            onClick={() => setActiveTab('completed')}
          >
            Completed
          </button>
        </div>

        <div className="orders-container">
          {filteredOrders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📍</div>
              <h3>No orders found</h3>
              <p>You have no {activeTab} orders at the moment.</p>
            </div>
          ) : (
            <div className="agent-orders-grid">
              {filteredOrders.map((order) => {
                const isLoading = loadingId === order.id;
                const canAccept = order.status === "ASSIGNED" || order.status === "PENDING";
                const canStart = order.status === "ACCEPTED";
                const canDeliver = order.status === "DELIVERING";

                return (
                  <div key={order.id} className="delivery-card premium-card animate-slide-up">
                    <div className="delivery-header">
                      <div className="delivery-id">Order #{order.id}</div>
                      <div className={`delivery-status status-${order.status.toLowerCase()}`}>
                        {order.status}
                      </div>
                    </div>
                    
                    <div className="delivery-body">
                      <div className="pickup-drop">
                        <div className="location pickup">
                          <div className="loc-icon">🏪</div>
                          <div>
                            <h4>Pickup</h4>
                            <p>{order.shop_name || "Assigned Shop"}</p>
                          </div>
                        </div>
                        <div className="route-line"></div>
                        <div className="location drop">
                          <div className="loc-icon">🏠</div>
                          <div>
                            <h4>Dropoff</h4>
                            <p>Customer Location</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="order-details">
                        <p><strong>Item:</strong> {order.item}</p>
                        <p><strong>Category:</strong> {order.category}</p>
                      </div>
                    </div>

                    <div className="delivery-actions">
                      {canAccept && (
                        <button
                          className="action-btn accept-btn"
                          onClick={() => updateStatus(order.id, "ACCEPTED")}
                          disabled={isLoading}
                        >
                          {isLoading ? "..." : "Swipe to Accept"}
                        </button>
                      )}
                      
                      {canStart && (
                        <button
                          className="action-btn start-btn"
                          onClick={() => updateStatus(order.id, "DELIVERING")}
                          disabled={isLoading}
                        >
                          {isLoading ? "..." : "Picked Up & Start Delivery"}
                        </button>
                      )}
                      
                      {canDeliver && (
                        <button
                          className="action-btn deliver-btn"
                          onClick={() => updateStatus(order.id, "DELIVERED")}
                          disabled={isLoading}
                        >
                          {isLoading ? "..." : "Mark as Delivered"}
                        </button>
                      )}

                      {(canStart || canDeliver) && (
                        <button
                          className="action-btn map-btn"
                          onClick={() => navigate(`/tracking/${order.id}`)}
                        >
                          View on Map 📍
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AgentDashboard;

/* 🎨 AGENT CSS */
const styles = `
.agent-page-wrapper {
  min-height: 100vh;
  background-color: var(--bg-main);
  padding-bottom: 2rem;
}

.agent-dashboard {
  padding-top: 2rem;
}

.agent-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 2rem;
}

.agent-profile {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.agent-avatar {
  font-size: 3rem;
  background: rgba(252,128,25,0.1);
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: var(--brand-primary);
}

.agent-header h1 {
  font-size: 2.2rem;
  color: var(--text-primary);
  margin-bottom: 0.2rem;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.dot-green {
  width: 10px;
  height: 10px;
  background-color: #48bb78;
  border-radius: 50%;
  box-shadow: 0 0 10px #48bb78;
}

.agent-stats {
  display: flex;
  gap: 1.5rem;
}

.stat-box {
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  padding: 1rem 1.5rem;
  border-radius: var(--radius-md);
  text-align: center;
  min-width: 120px;
  box-shadow: var(--shadow-sm);
}

.stat-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--brand-primary);
}

.stat-label {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.tabs-container {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid var(--border-light);
  padding-bottom: 1px;
}

.tab-btn {
  padding: 1rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-secondary);
  border-bottom: 3px solid transparent;
  border-radius: 0;
  position: relative;
  transition: all 0.2s;
}

.tab-btn.active {
  color: var(--brand-primary);
  border-bottom-color: var(--brand-primary);
}

.tab-btn .badge {
  position: absolute;
  top: 5px;
  right: 0px;
  background: var(--brand-secondary);
  color: white;
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 10px;
}

.agent-orders-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.delivery-card {
  background: var(--bg-card);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-light);
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: transform 0.2s;
}

.delivery-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.delivery-header {
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-light);
  background: #f8fafc;
}

.delivery-id {
  font-weight: 700;
  color: var(--text-primary);
}

.delivery-status {
  padding: 0.3rem 0.8rem;
  border-radius: var(--radius-full);
  font-size: 0.8rem;
  font-weight: 700;
}

.status-pending, .status-assigned { background: #fef3c7; color: #d97706; }
.status-accepted { background: #e0e7ff; color: #4f46e5; }
.status-delivering { background: #ffedd5; color: #ea580c; }
.status-delivered { background: #dcfce3; color: #16a34a; }

.delivery-body {
  padding: 1.5rem;
}

.pickup-drop {
  position: relative;
  margin-bottom: 1.5rem;
}

.location {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.pickup { margin-bottom: 1.5rem; }

.loc-icon {
  font-size: 1.5rem;
  width: 40px;
  height: 40px;
  background: var(--bg-main);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  z-index: 2;
}

.location h4 {
  margin: 0 0 0.2rem 0;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.location p {
  margin: 0;
  font-weight: 600;
  color: var(--text-primary);
}

.route-line {
  position: absolute;
  left: 20px;
  top: 40px;
  bottom: 40px;
  width: 2px;
  background: dashed 2px var(--border-medium);
  z-index: 1;
}

.order-details {
  background: var(--bg-main);
  padding: 1rem;
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
}

.order-details p {
  margin-bottom: 0.5rem;
}
.order-details p:last-child {
  margin-bottom: 0;
}

.delivery-actions {
  padding: 1rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  background: #f8fafc;
  border-top: 1px solid var(--border-light);
  margin-top: auto;
}

.action-btn {
  width: 100%;
  padding: 1rem;
  border-radius: var(--radius-sm);
  font-weight: 700;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.accept-btn {
  background: #4f46e5;
  color: white;
}
.accept-btn:hover { background: #4338ca; }

.start-btn {
  background: var(--brand-primary);
  color: white;
}
.start-btn:hover { background: #e57317; }

.deliver-btn {
  background: #16a34a;
  color: white;
}
.deliver-btn:hover { background: #15803d; }

.map-btn {
  background: white;
  color: var(--text-primary);
  border: 1px solid var(--border-medium);
}
.map-btn:hover { background: #f1f5f9; }

@media (max-width: 768px) {
  .agent-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
    padding: 1.5rem;
  }
}
`;

if (typeof document !== "undefined") {
  const styleTag = document.createElement("style");
  styleTag.innerHTML = styles;
  document.head.appendChild(styleTag);
}