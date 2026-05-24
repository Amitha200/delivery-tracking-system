import { useNavigate, useLocation } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const role = localStorage.getItem("role") || "";
  
  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  const getDashboardRoute = () => {
    if (role === "ADMIN") return "/admin";
    if (role === "AGENT") return "/agent";
    if (role === "CUSTOMER") return "/customer";
    return "/";
  };

  return (
    <div className="navbar glass">
      <div className="nav-left" onClick={() => navigate(getDashboardRoute())} style={{cursor: 'pointer'}}>
        <span className="nav-logo">🚀</span>
        <span className="nav-title">QuickDrop</span>
        {role && <span className="nav-role-badge">{role}</span>}
      </div>

      <div className="nav-right">
        {role === "ADMIN" && (
          <button 
            className={`nav-link ${location.pathname.includes('report') ? 'active' : ''}`}
            onClick={() => navigate("/report")}
          >
            Reports
          </button>
        )}
        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default Navbar;

/* 🎨 NAVBAR CSS */
const styles = `
.navbar {
  position: sticky;
  top: 0;
  z-index: 1000;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: #ffffff;
  backdrop-filter: blur(12px);
  border-bottom: 1px solid #e9ecee;
  box-shadow: 0 2px 10px rgba(0,0,0,0.02);
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-logo {
  font-size: 1.8rem;
}

.nav-title {
  font-size: 1.4rem;
  font-weight: 800;
  color: #1e1e1e;
  font-family: var(--font-heading);
  letter-spacing: -0.5px;
}

.nav-role-badge {
  background: #f1f1f1;
  border: 1px solid #d4d5d9;
  padding: 0.2rem 0.6rem;
  border-radius: var(--radius-full);
  font-size: 0.7rem;
  font-weight: 700;
  color: #4b5563;
  margin-left: 0.5rem;
  letter-spacing: 0.5px;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.nav-link {
  color: #4b5563;
  font-weight: 600;
  font-size: 0.95rem;
  padding: 0.5rem;
}

.nav-link:hover {
  color: var(--brand-primary);
}

.nav-link.active {
  color: var(--brand-primary);
}

.logout-btn {
  background: #ffffff;
  color: #1e1e1e;
  border: 1px solid #d4d5d9;
  padding: 0.6rem 1.2rem;
  border-radius: var(--radius-sm);
  font-weight: 600;
  transition: all 0.2s;
}

.logout-btn:hover {
  background: #fff1f2;
  color: #e11d48;
  border-color: #fecdd3;
}
`;

if (typeof document !== "undefined") {
  const styleTag = document.createElement("style");
  styleTag.innerHTML = styles;
  document.head.appendChild(styleTag);
}