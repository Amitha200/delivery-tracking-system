import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const API = "http://127.0.0.1:8000/api";

/* 🔵 AGENT ICON */
const agentIcon = new L.DivIcon({
  className: "",
  html: `<div style="
    width:20px;height:20px;
    background:var(--brand-primary);
    border-radius:50%;
    border:4px solid white;
    box-shadow:0 0 15px rgba(252,128,25,0.8);
    display:flex;align-items:center;justify-content:center;
  "></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

/* 🔴 DESTINATION ICON */
const destIcon = new L.DivIcon({
  className: "",
  html: `<div style="
    font-size:24px;
    filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));
  ">🏠</div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 24],
});

/* 🟢 PICKUP ICON */
const pickupIcon = new L.DivIcon({
  className: "",
  html: `<div style="
    font-size:24px;
    filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));
  ">🏪</div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 24],
});

/* 📏 DISTANCE CALCULATION */
const getDistance = (a, b) => {
  const R = 6371;
  const dLat = (b[0] - a[0]) * Math.PI / 180;
  const dLng = (b[1] - a[1]) * Math.PI / 180;

  const lat1 = a[0] * Math.PI / 180;
  const lat2 = b[0] * Math.PI / 180;

  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);

  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
};

/* 🎯 SMOOTH MOVEMENT */
const lerp = (a, b, t) => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
];

function LiveTracking() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const auth = { Authorization: `Bearer ${token}` };

  const [pickup, setPickup] = useState(null);
  const [dest, setDest] = useState(null);
  const [agent, setAgent] = useState(null);
  const [orderData, setOrderData] = useState(null);

  const [status, setStatus] = useState("PENDING");

  const startedRef = useRef(false);
  const deliveredRef = useRef(false);
  const animRef = useRef(null);

  /* 📦 LOAD ORDER */
  useEffect(() => {
    axios
      .get(`${API}/orders/${orderId}/`, { headers: auth })
      .then((res) => {
        const o = res.data;
        setOrderData(o);

        const p = [o.pickup_lat, o.pickup_lng];
        const d = [o.drop_lat, o.drop_lng];

        setPickup(p);
        setDest(d);
        setAgent(p);
        setStatus(o.status);
      })
      .catch(() => {
        alert("Failed to load order tracking");
        navigate(-1);
      });
  }, [orderId]);

  /* 👀 CUSTOMER LIVE TRACK */
  useEffect(() => {
    if (role !== "CUSTOMER") return;

    const interval = setInterval(async () => {
      const res = await axios.get(`${API}/orders/${orderId}/`, {
        headers: auth,
      });

      const o = res.data;

      if (o.current_lat && o.current_lng) {
        setAgent([o.current_lat, o.current_lng]);
      }

      setStatus(o.status);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  /* 🚚 AUTO MOVEMENT FOR SIMULATION */
  useEffect(() => {
    if (!pickup || !dest) return;
    if (status !== "DELIVERING") return;
    if (startedRef.current) return;

    startedRef.current = true;

    const duration = 45000; // 45 sec simulation
    const startTime = Date.now();

    const animate = async () => {
      const elapsed = Date.now() - startTime;
      let t = elapsed / duration;
      if (t > 1) t = 1;

      const pos = lerp(pickup, dest, t);
      setAgent(pos);

      /* 🔄 Update backend location */
      try {
        await axios.post(
          `${API}/orders/${orderId}/update_location/`,
          { lat: pos[0], lng: pos[1] },
          { headers: auth }
        );
      } catch {}

      /* ✅ AUTO DELIVER */
      if (t === 1 && !deliveredRef.current) {
        deliveredRef.current = true;

        try {
          await axios.post(
            `${API}/orders/${orderId}/status/`,
            { status: "DELIVERED" },
            { headers: auth }
          );

          setStatus("DELIVERED");
        } catch (err) {
          console.error("DELIVERY ERROR:", err.response?.data);
        }

        return;
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animRef.current);
  }, [status, pickup, dest]);

  /* ▶ START DELIVERY */
  const startDelivery = async () => {
    try {
      await axios.post(
        `${API}/orders/${orderId}/status/`,
        { status: "DELIVERING" },
        { headers: auth }
      );

      setStatus("DELIVERING");
    } catch (err) {
      alert(err.response?.data?.error || "Start failed");
    }
  };

  /* 📊 ETA */
  const distance = agent && dest ? getDistance(agent, dest) : 0;
  const eta = distance ? Math.ceil((distance / 30) * 60) : null;

  if (!pickup || !dest || !agent || !orderData) {
    return (
      <div className="tracking-loader">
        <div className="spinner"></div>
        <p>Loading your delivery...</p>
      </div>
    );
  }

  /* 📦 STATUS TEXT */
  const getStatusText = () => {
    switch(status) {
      case "PENDING": return "Finding a delivery partner";
      case "ASSIGNED": return "Partner assigned";
      case "ACCEPTED": return "Partner is at the pickup location";
      case "DELIVERING": return "On the way to you";
      case "DELIVERED": return "Delivered Successfully 🎉";
      default: return "Processing";
    }
  };



  return (
    <div className="tracking-container">
      {/* 🔝 OVERLAY UI */}
      <div className="tracking-overlay animate-slide-up">
        <button className="back-btn-overlay" onClick={() => navigate(-1)}>
          ← Back
        </button>
        
        <div className="tracking-card glass">
          <div className="tracking-header">
            <div>
              <h3>{getStatusText()}</h3>
              <p className="order-meta">{role === "CUSTOMER" ? "Your Order" : `Order #${orderId}`} • {orderData.item}</p>
            </div>
            {status === "DELIVERING" && (
              <div className="eta-badge">
                <span className="eta-time">{eta || "--"}</span>
                <span className="eta-unit">MIN</span>
              </div>
            )}
          </div>

          <div className="progress-bar-container">
            <div className={`progress-step ${status === 'PENDING' ? 'active' : 'completed'}`}></div>
            <div className={`progress-step ${['ACCEPTED', 'ASSIGNED'].includes(status) ? 'active' : status === 'DELIVERING' ? 'completed' : ''}`}></div>
            <div className={`progress-step ${status === 'DELIVERING' ? 'active' : ''}`}></div>
          </div>

          <div className="tracking-details">
            <div className="detail-row">
              <span className="icon">🏪</span>
              <div className="detail-text">
                <p className="label">Pickup from</p>
                <p className="value">{orderData.shop_name}</p>
              </div>
            </div>
            <div className="detail-row">
              <span className="icon">🏠</span>
              <div className="detail-text">
                <p className="label">Delivery to</p>
                <p className="value">Customer Address</p>
              </div>
            </div>
          </div>

          {role === "AGENT" && status === "ACCEPTED" && (
            <button className="swipe-start-btn" onClick={startDelivery}>
              Swipe to Start Delivery ➔
            </button>
          )}

          {status === "DELIVERED" && (
            <button className="swipe-start-btn" onClick={() => navigate(`/${role.toLowerCase()}`)} style={{background: 'var(--success)'}}>
              Back to Dashboard
            </button>
          )}
        </div>
      </div>

      {/* 🗺 MAP */}
      <div className="map-wrapper">
        <MapContainer 
          center={status === "DELIVERING" ? agent : pickup} 
          zoom={14} 
          zoomControl={false}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer 
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" 
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />

          {/* Show dotted full path only if tracking is active (not pending) */}
          {(status === "ACCEPTED" || status === "DELIVERING" || status === "DELIVERED") && (
            <Polyline 
              positions={[pickup, dest]} 
              color="#94a3b8" 
              weight={4} 
              dashArray="10, 10"
              opacity={0.6}
            />
          )}

          {/* Route from Agent to Pickup when ACCEPTED */}
          {status === "ACCEPTED" && agent && (
            <Polyline 
              positions={[agent, pickup]} 
              color="var(--brand-primary)" 
              weight={5} 
            />
          )}

          {/* Route from Agent to Dropoff when DELIVERING */}
          {status === "DELIVERING" && agent && (
            <Polyline 
              positions={[agent, dest]} 
              color="var(--brand-primary)" 
              weight={5} 
            />
          )}

          <Marker position={pickup} icon={pickupIcon}>
            <Popup>Pickup: {orderData.shop_name}</Popup>
          </Marker>

          {/* Only show Agent icon if they are actively working on it */}
          {(status === "ACCEPTED" || status === "DELIVERING") && agent && (
            <Marker position={agent} icon={agentIcon}>
              <Popup>Delivery Partner</Popup>
            </Marker>
          )}

          <Marker position={dest} icon={destIcon}>
            <Popup>Delivery Address</Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
}

export default LiveTracking;

/* 🎨 TRACKING CSS */
const styles = `
.tracking-container {
  position: relative;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background: #f8f9fa;
}

.map-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

.tracking-overlay {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  max-width: 400px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.back-btn-overlay {
  align-self: flex-start;
  background: white;
  padding: 8px 16px;
  border-radius: var(--radius-full);
  box-shadow: var(--shadow-sm);
  font-weight: 600;
  border: none;
  cursor: pointer;
  color: var(--text-primary);
}

.tracking-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 1.5rem;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  border: 1px solid rgba(255,255,255,0.5);
}

.tracking-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.tracking-header h3 {
  font-size: 1.2rem;
  margin-bottom: 0.2rem;
  color: var(--text-primary);
}

.order-meta {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.eta-badge {
  background: var(--brand-primary);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-md);
  text-align: center;
  box-shadow: 0 4px 10px rgba(252, 128, 25, 0.3);
}

.eta-time {
  display: block;
  font-size: 1.5rem;
  font-weight: 800;
  line-height: 1;
}

.eta-unit {
  font-size: 0.7rem;
  font-weight: 600;
}

.progress-bar-container {
  display: flex;
  gap: 5px;
  margin-bottom: 1.5rem;
}

.progress-step {
  flex: 1;
  height: 6px;
  background: var(--border-light);
  border-radius: var(--radius-full);
}

.progress-step.active {
  background: var(--brand-primary);
  animation: pulse 2s infinite;
}

.progress-step.completed {
  background: var(--brand-primary);
}

.tracking-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.detail-row .icon {
  font-size: 1.5rem;
  width: 40px;
  height: 40px;
  background: var(--bg-main);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.detail-text .label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-text .value {
  font-weight: 600;
  color: var(--text-primary);
}

.swipe-start-btn {
  width: 100%;
  margin-top: 1.5rem;
  padding: 1.2rem;
  background: var(--brand-dark);
  color: white;
  border-radius: var(--radius-sm);
  font-weight: 700;
  font-size: 1.1rem;
  border: none;
  cursor: pointer;
  transition: background 0.2s;
}

.swipe-start-btn:hover {
  background: #333;
}

.tracking-loader {
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  background: var(--bg-main);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--border-light);
  border-top-color: var(--brand-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.delivered-screen {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8f9fa, #e9ecee);
}

.delivered-content {
  background: white;
  padding: 3rem;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  text-align: center;
  max-width: 400px;
  width: 90%;
}

.success-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-20px); }
  60% { transform: translateY(-10px); }
}

.delivered-content h2 {
  color: #16a34a;
  margin-bottom: 0.5rem;
}

.delivered-content p {
  color: var(--text-secondary);
  margin-bottom: 2rem;
}

.back-home-btn {
  width: 100%;
  padding: 1rem;
  background: var(--brand-primary);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
}

.leaflet-control-attribution {
  display: none;
}
`;

if (typeof document !== "undefined") {
  const styleTag = document.createElement("style");
  styleTag.innerHTML = styles;
  document.head.appendChild(styleTag);
}
