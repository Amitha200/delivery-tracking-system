import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

const API = "http://127.0.0.1:8000/api";

function CustomerDashboard() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const [item, setItem] = useState("");
  const [category, setCategory] = useState("");
  const [shop_name, setShopName] = useState("");
  const [pickup, setPickup] = useState(null);
  const [drop, setDrop] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("orders"); // orders, new
  
  const username = localStorage.getItem("username") || "Customer";

  /* ✅ TOKEN */
  const getAuthHeader = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Login again ❌");
      navigate("/");
      return null;
    }

    return { Authorization: `Bearer ${token}` };
  };

  /* ================= FETCH ================= */
  const fetchOrders = async () => {
    try {
      const headers = getAuthHeader();
      if (!headers) return;

      const res = await axios.get(`${API}/orders/my_orders/`, { headers });
      setOrders(res.data);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.clear();
        navigate("/");
      }
    }
  };

  const fetchNotifications = async () => {
    try {
      const headers = getAuthHeader();
      if (!headers) return;

      const res = await axios.get(`${API}/orders/notifications/`, { headers });
      setNotifications(res.data);
    } catch {}
  };

  useEffect(() => {
    fetchOrders();
    fetchNotifications();

    const interval = setInterval(() => {
      fetchOrders();
      fetchNotifications();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  /* ================= 📍 PICKUP ================= */
  const getLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setPickup(coords);
      },
      (err) => {
        console.error(err);
        alert("Enable location permission ❌");
      }
    );
  };

  /* ================= 📌 DROP ================= */
  const setDropLocation = () => {
    const coords = { lat: 9.935, lng: 76.275 }; // Dummy for now, or use map picker
    setDrop(coords);
    alert("Drop location set to home address ✅");
  };

  /* ================= CREATE ORDER ================= */
  const createOrder = async (e) => {
    e.preventDefault();

    if (!item || !category || !shop_name) {
      return alert("Please fill all details ❗");
    }
    if (!pickup) return alert("Pickup location not set ❗");
    if (!drop) return alert("Drop location not set ❗");

    try {
      setLoading(true);
      const headers = getAuthHeader();
      if (!headers) return;

      await axios.post(
        `${API}/orders/`,
        {
          item,
          category,
          shop_name,
          pickup_lat: pickup.lat,
          pickup_lng: pickup.lng,
          drop_lat: drop.lat,
          drop_lng: drop.lng,
        },
        { headers }
      );

      alert("Order placed successfully! ✅");

      setItem("");
      setCategory("");
      setShopName("");
      setPickup(null);
      setDrop(null);
      setActiveTab("orders");

      fetchOrders();
    } catch (err) {
      console.error(err.response?.data);
      alert(err.response?.data?.error || "Order failed ❌");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING": return "status-warning";
      case "ACCEPTED": return "status-info";
      case "DELIVERING": return "status-primary";
      case "DELIVERED": return "status-success";
      default: return "status-default";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "PENDING": return "🕒";
      case "ACCEPTED": return "👍";
      case "DELIVERING": return "🛵";
      case "DELIVERED": return "✅";
      default: return "📦";
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar />

      <div className="dashboard-container container animate-fade-in">
        <div className="dashboard-header">
          <div className="dashboard-header-text">
            <h1>Hello, {username} 👋</h1>
            <p className="subtitle">Order food, groceries & more.</p>
          </div>
          <div className="dashboard-actions">
            <button 
              className={`tab-btn ${activeTab === "orders" ? "active" : ""}`}
              onClick={() => setActiveTab("orders")}
            >
              My Orders
            </button>
            <button 
              className={`tab-btn ${activeTab === "new" ? "active" : ""}`}
              onClick={() => setActiveTab("new")}
            >
              + New Order
            </button>
          </div>
        </div>

        <div className="dashboard-content">
          {/* Main Area based on Tab */}
          <div className="main-area">
            {activeTab === "new" ? (
              <div className="premium-card animate-slide-up">
                <h2>Create Custom Delivery</h2>
                <p className="card-subtitle">Get anything delivered to your doorstep</p>

                <form onSubmit={createOrder} className="order-form">
                  <div className="form-group">
                    <label>What do you need?</label>
                    <input
                      placeholder="e.g., Groceries, Medicines, Food..."
                      value={item}
                      onChange={(e) => setItem(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Category</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                      >
                        <option value="">Select Category</option>
                        <option value="Food">🍔 Food</option>
                        <option value="Groceries">🥦 Groceries</option>
                        <option value="Medicine">💊 Medicine</option>
                        <option value="Documents">📄 Documents</option>
                        <option value="Other">📦 Other</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Shop/Pickup Name</label>
                      <input
                        placeholder="e.g., Local Supermarket"
                        value={shop_name}
                        onChange={(e) => setShopName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="location-picker">
                    <div className="loc-btn-group">
                      <button type="button" onClick={getLocation} className={`loc-btn ${pickup ? 'set' : ''}`}>
                        <span className="icon">📍</span> 
                        {pickup ? "Pickup Set" : "Set Pickup Location"}
                      </button>
                      <button type="button" onClick={setDropLocation} className={`loc-btn ${drop ? 'set' : ''}`}>
                        <span className="icon">🏠</span> 
                        {drop ? "Drop Set" : "Set Drop Location"}
                      </button>
                    </div>
                    {(pickup || drop) && (
                      <div className="coords-display">
                        {pickup && <span>Pickup: {pickup.lat.toFixed(4)}, {pickup.lng.toFixed(4)}</span>}
                        {drop && <span>Drop: {drop.lat.toFixed(4)}, {drop.lng.toFixed(4)}</span>}
                      </div>
                    )}
                  </div>

                  <button type="submit" className="place-order-btn" disabled={loading}>
                    {loading ? "Processing..." : "Place Delivery Request"}
                  </button>
                </form>
              </div>
            ) : (
              <div className="orders-list animate-fade-in">
                <h2>Active Deliveries</h2>
                {orders.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">🛵</div>
                    <h3>No active orders</h3>
                    <p>Need something? Create a new order now.</p>
                    <button className="primary-action-btn" onClick={() => setActiveTab("new")}>
                      Order Now
                    </button>
                  </div>
                ) : (
                  <div className="orders-grid">
                    {orders.map((order, index) => {
                      const customerOrderNumber = orders.length - index;
                      return (
                      <div key={order.id} className="premium-card order-card">
                        <div className="order-card-header">
                          <div className="order-id">Order #{customerOrderNumber}</div>
                          <span className={`status-badge ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)} {order.status}
                          </span>
                        </div>
                        <div className="order-card-body">
                          <h3 className="order-item">{order.item}</h3>
                          <p className="order-shop">From: {order.shop_name}</p>
                          <p className="order-category">{order.category}</p>
                        </div>
                        <div className="order-card-footer">
                          <button
                            onClick={() => navigate(`/tracking/${order.id}`)}
                            className="track-btn"
                          >
                            Track Delivery <span>→</span>
                          </button>
                        </div>
                      </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar Area */}
          <div className="sidebar-area">
            <div className="premium-card notifications-card">
              <div className="card-header">
                <h3>Notifications</h3>
                <span className="badge">{
                  notifications.filter(n => orders.some(o => n.message.includes(`#${o.id}`))).length
                }</span>
              </div>
              <div className="notifications-list">
                {notifications.filter(n => orders.some(o => n.message.includes(`#${o.id}`))).length === 0 ? (
                  <p className="empty-text">You have no notifications yet.</p>
                ) : (
                  notifications
                    .filter(n => orders.some(o => n.message.includes(`#${o.id}`)))
                    .slice(0, 5)
                    .map((n) => {
                      // Replace global ID with customer's specific order number
                      const formattedMessage = n.message.replace(/#(\d+)/, (match, id) => {
                        const idx = orders.findIndex(o => o.id === parseInt(id));
                        return idx !== -1 ? `#${orders.length - idx}` : match;
                      });
                      
                      return (
                        <div key={n.id} className="notification-item">
                          <div className="dot"></div>
                          <p>{formattedMessage}</p>
                        </div>
                      );
                    })
                )}
              </div>
            </div>

            <div className="promo-card">
              <h3>QuickDrop Pro</h3>
              <p>Get free delivery and exclusive discounts.</p>
              <button className="promo-btn">Explore</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomerDashboard;

/* 🎨 CUSTOMER DASHBOARD CSS */
const styles = `
.dashboard-container {
  padding-top: 2rem;
  padding-bottom: 4rem;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 2rem;
}

.dashboard-header-text h1 {
  font-size: 2.2rem;
  color: var(--text-primary);
  margin-bottom: 0.2rem;
}

.dashboard-header-text p {
  color: var(--text-secondary);
  font-size: 1.1rem;
}

.dashboard-actions {
  display: flex;
  background: var(--bg-card);
  padding: 0.5rem;
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
}

.tab-btn {
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-full);
  color: var(--text-secondary);
  font-weight: 600;
  background: transparent;
}

.tab-btn.active {
  background: var(--brand-dark);
  color: white;
  box-shadow: var(--shadow-sm);
}

.dashboard-content {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 2rem;
}

/* Base text overrides for cards */
.card-subtitle {
  color: var(--text-secondary);
  margin-bottom: 2rem;
}

/* Order Form */
.order-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
}

.form-group label {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 0.95rem;
}

.form-group input, .form-group select {
  padding: 1rem;
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-sm);
  font-family: inherit;
  font-size: 1rem;
  transition: all var(--transition-fast);
  background: #f8f9fa;
  color: #1e1e1e;
}

.form-group input:focus, .form-group select:focus {
  border-color: var(--brand-primary);
  box-shadow: 0 0 0 3px rgba(252, 128, 25, 0.1);
  outline: none;
}

.form-row {
  display: flex;
  gap: 1.5rem;
}

.location-picker {
  background: var(--bg-main);
  padding: 1.5rem;
  border-radius: var(--radius-sm);
  border: 1px dashed var(--border-medium);
}

.loc-btn-group {
  display: flex;
  gap: 1rem;
}

.loc-btn {
  flex: 1;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: white;
  border: 1px solid var(--border-medium);
  border-radius: var(--radius-sm);
  color: #1e1e1e;
}

.loc-btn:hover {
  border-color: #1e1e1e;
}

.loc-btn.set {
  background: rgba(96, 178, 70, 0.1);
  border-color: var(--success);
  color: var(--success);
}

.coords-display {
  margin-top: 1rem;
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.place-order-btn {
  background: var(--brand-primary);
  color: white;
  padding: 1.2rem;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: var(--radius-sm);
  margin-top: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.place-order-btn:hover {
  background: #e57317;
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.place-order-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Orders List */
.orders-list h2 {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
}

.orders-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.order-card {
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  transition: all var(--transition-normal);
}

.order-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.order-card-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-light);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(0,0,0,0.01);
}

.order-id {
  font-weight: 600;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.status-badge {
  padding: 0.35rem 0.75rem;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  text-transform: uppercase;
}

.status-warning { background: rgba(241, 149, 55, 0.15); color: #c26e15; }
.status-info { background: rgba(33, 150, 243, 0.15); color: #1565c0; }
.status-primary { background: rgba(252, 128, 25, 0.15); color: var(--brand-primary); }
.status-success { background: rgba(96, 178, 70, 0.15); color: #3e8e26; }
.status-default { background: var(--bg-main); color: var(--text-secondary); }

.order-card-body {
  padding: 1.5rem;
}

.order-item {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
}

.order-shop {
  color: var(--text-primary);
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.order-category {
  color: var(--text-muted);
  font-size: 0.9rem;
}

.order-card-footer {
  padding: 1rem 1.5rem;
  background: var(--bg-main);
}

.track-btn {
  width: 100%;
  padding: 0.85rem;
  background: white;
  border: 1px solid var(--brand-primary);
  color: var(--brand-primary);
  font-weight: 600;
  border-radius: var(--radius-sm);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.track-btn:hover {
  background: var(--brand-primary);
  color: white;
}

/* Sidebar */
.sidebar-area {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.notifications-card {
  padding: 1.5rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.card-header h3 {
  margin: 0;
  font-size: 1.1rem;
}

.badge {
  background: var(--brand-primary);
  color: white;
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 0.8rem;
  font-weight: 600;
}

.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.notification-item {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-light);
}

.notification-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.notification-item .dot {
  width: 8px;
  height: 8px;
  background: var(--brand-primary);
  border-radius: 50%;
  margin-top: 6px;
  flex-shrink: 0;
}

.notification-item p {
  font-size: 0.9rem;
  color: var(--text-primary);
  line-height: 1.4;
}

.empty-text {
  color: var(--text-muted);
  text-align: center;
  padding: 1rem 0;
}

.promo-card {
  background: linear-gradient(135deg, var(--brand-dark), #333);
  border-radius: var(--radius-md);
  padding: 1.5rem;
  color: white;
}

.promo-card h3 {
  color: #fce4ce;
  margin-bottom: 0.5rem;
}

.promo-card p {
  color: rgba(255,255,255,0.8);
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.promo-btn {
  background: white;
  color: var(--brand-dark);
  padding: 0.5rem 1rem;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: var(--bg-card);
  border-radius: var(--radius-md);
  border: 1px dashed var(--border-medium);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}

.primary-action-btn {
  background: var(--brand-primary);
  color: white;
  padding: 0.75rem 2rem;
  border-radius: var(--radius-full);
}

@media (max-width: 900px) {
  .dashboard-content {
    grid-template-columns: 1fr;
  }
  
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .form-row {
    flex-direction: column;
    gap: 1rem;
  }
  
  .loc-btn-group {
    flex-direction: column;
  }
}
`;

if (typeof document !== "undefined") {
  const styleTag = document.createElement("style");
  styleTag.innerHTML = styles;
  document.head.appendChild(styleTag);
}
