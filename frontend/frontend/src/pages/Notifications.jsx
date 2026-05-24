import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

function Notifications() {
  const [notes, setNotes] = useState([]);
  const token = localStorage.getItem("token");

  const fetchNotes = () => {
    axios
      .get("http://127.0.0.1:8000/api/orders/notifications/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setNotes(res.data);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  return (
    <div className="page-wrapper" style={{background: 'var(--bg-main)', minHeight: '100vh'}}>
      <Navbar />
      <div className="container animate-fade-in" style={{maxWidth: '600px', paddingTop: '2rem'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem'}}>
          <span style={{fontSize: '2rem'}}>🔔</span>
          <h2 style={{margin: 0}}>Notifications</h2>
        </div>

        <div className="notifications-list">
          {notes.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>All caught up!</h3>
              <p>You have no new notifications.</p>
            </div>
          ) : (
            notes.map((n, index) => (
              <div key={index} className="notification-card animate-slide-up" style={{animationDelay: `${index * 0.1}s`}}>
                <div className="notification-icon">💬</div>
                <div className="notification-content">
                  <p>{n.message}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Notifications;

/* 🎨 NOTIFICATIONS CSS */
const styles = `
.notification-card {
  background: white;
  border-radius: var(--radius-md);
  padding: 1.2rem;
  margin-bottom: 1rem;
  box-shadow: var(--shadow-sm);
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  border-left: 4px solid var(--brand-primary);
  transition: transform 0.2s;
}

.notification-card:hover {
  transform: translateX(5px);
  box-shadow: var(--shadow-md);
}

.notification-icon {
  background: var(--bg-main);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.notification-content p {
  margin: 0;
  color: var(--text-primary);
  line-height: 1.5;
  font-weight: 500;
}
`;

if (typeof document !== "undefined") {
  const styleTag = document.createElement("style");
  styleTag.innerHTML = styles;
  document.head.appendChild(styleTag);
}