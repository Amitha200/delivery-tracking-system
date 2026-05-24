import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const [role, setRole] = useState(null);
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedRole = localStorage.getItem("role");

    if (token && savedRole) {
      redirectByRole(savedRole);
    }
  }, []);

  const redirectByRole = (role) => {
    const r = role?.toUpperCase().trim();
    if (r === "ADMIN") navigate("/admin");
    else if (r === "AGENT") navigate("/agent");
    else navigate("/customer");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      alert("Please enter both username and password");
      return;
    }

    setIsLoading(true);
    
    try {
      if (mode === "register") {
        await axios.post("http://127.0.0.1:8000/api/register/", {
          username,
          password,
          role,
        });
        alert("Account created successfully! Please login.");
        setMode("login");
      } else {
        const res = await axios.post("http://127.0.0.1:8000/api/login/", {
          username,
          password,
        });
        
        const token = res.data.access;
        if (!token) throw new Error("Invalid response");
        
        localStorage.setItem("token", token);
        localStorage.setItem("role", role.toUpperCase().trim());
        localStorage.setItem("username", username);
        redirectByRole(role);
      }
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.error || "Authentication failed";
      alert(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-split">
        {/* Left Side - Branding */}
        <div className="login-brand animate-fade-in">
          <div className="brand-content">
            <h1 className="logo">QuickDrop<span className="dot">.</span></h1>
            <p className="tagline">Need something fast?<br/><span className="highlight">Get items delivered in minutes.</span></p>
            <div className="features">
              <div className="feature"><span className="icon">🚀</span> Live Tracking</div>
              <div className="feature"><span className="icon">🍔</span> Multi-Order</div>
              <div className="feature"><span className="icon">📍</span> Smart Routes</div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="login-form-container animate-slide-up">
          <div className="form-card">
            {!role ? (
              <div className="role-selection">
                <h2>Welcome Back</h2>
                <p className="subtitle">Choose your portal to continue</p>
                <div className="role-grid">
                  <button className="role-btn customer" onClick={() => setRole("CUSTOMER")}>
                    <div className="role-icon">🛍️</div>
                    <h3>Customer</h3>
                    <p>Place an order</p>
                  </button>
                  <button className="role-btn agent" onClick={() => setRole("AGENT")}>
                    <div className="role-icon">🛵</div>
                    <h3>Agent</h3>
                    <p>Deliver orders</p>
                  </button>
                  <button className="role-btn admin" onClick={() => setRole("ADMIN")}>
                    <div className="role-icon">👑</div>
                    <h3>Admin</h3>
                    <p>Manage system</p>
                  </button>
                </div>
              </div>
            ) : (
              <div className="auth-form">
                <button className="back-btn" onClick={() => setRole(null)}>
                  ← Back to Roles
                </button>
                <div className="form-header">
                  <h2>{mode === "login" ? "Login" : "Sign up"}</h2>
                  <p>
                    or <span className="toggle-mode" onClick={() => setMode(mode === "login" ? "register" : "login")}>
                      {mode === "login" ? "create an account" : "login to your account"}
                    </span>
                  </p>
                </div>
                
                <form onSubmit={handleSubmit}>
                  <div className="input-group">
                    <input 
                      type="text" 
                      required 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Username"
                    />
                  </div>
                  <div className="input-group">
                    <input 
                      type="password" 
                      required 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                    />
                  </div>
                  <button 
                    type="submit" 
                    className={`submit-btn ${isLoading ? 'loading' : ''}`}
                    disabled={isLoading}
                  >
                    {isLoading ? "Processing..." : (mode === "login" ? "LOGIN" : "REGISTER")}
                  </button>
                </form>
                <div className="policy-text">
                  By clicking on Login, I accept the Terms & Conditions & Privacy Policy
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;

/* 🎨 Swiggy/Zomato Inspired CSS */
const styles = `
.login-wrapper {
  height: 100vh;
  width: 100vw;
  display: flex;
  background-color: var(--bg-main);
  overflow: hidden;
  position: absolute;
  top: 0;
  left: 0;
}

.login-split {
  display: flex;
  width: 100%;
  height: 100%;
}

.login-brand {
  flex: 1;
  background-color: var(--brand-primary);
  color: white;
  display: flex;
  align-items: center;
  padding: 5rem;
  position: relative;
  overflow: hidden;
}

.login-brand::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(252,128,25,0.15) 0%, rgba(30,30,30,0) 60%);
  z-index: 0;
}

.brand-content {
  position: relative;
  z-index: 1;
  max-width: 500px;
}

.logo {
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 2rem;
  color: white;
  letter-spacing: -1px;
}

.dot {
  color: var(--brand-primary);
}

.tagline {
  font-size: 2.5rem;
  font-family: var(--font-heading);
  font-weight: 600;
  line-height: 1.2;
  margin-bottom: 3rem;
  color: rgba(255, 255, 255, 0.9);
}

.highlight {
  color: var(--brand-primary);
}

.features {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.feature {
  font-size: 1.25rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 1rem;
  color: rgba(255, 255, 255, 0.8);
}

.feature .icon {
  font-size: 1.8rem;
  background: rgba(255, 255, 255, 0.1);
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
}

.login-form-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
  padding: 2rem;
}

.form-card {
  width: 100%;
  max-width: 440px;
}

.role-selection h2 {
  font-size: 2rem;
  color: var(--text-primary);
}

.subtitle {
  color: var(--text-secondary);
  margin-bottom: 2rem;
  font-size: 1.1rem;
}

.role-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.role-btn {
  display: flex;
  align-items: center;
  padding: 1.25rem;
  border: 1px solid var(--border-light);
  background: white;
  border-radius: var(--radius-md);
  text-align: left;
  transition: all var(--transition-normal);
  width: 100%;
}

.role-btn:hover {
  border-color: var(--brand-primary);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.role-icon {
  font-size: 2.5rem;
  margin-right: 1.5rem;
  background: var(--bg-main);
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
}

.role-btn h3 {
  margin: 0;
  font-size: 1.2rem;
  color: var(--text-primary);
}

.role-btn p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.auth-form {
  animation: fadeIn var(--transition-normal) forwards;
}

.back-btn {
  color: var(--text-secondary);
  font-size: 0.9rem;
  padding: 0;
  margin-bottom: 2rem;
}

.back-btn:hover {
  color: var(--text-primary);
}

.form-header {
  margin-bottom: 2.5rem;
}

.form-header h2 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.form-header p {
  color: var(--text-secondary);
}

.toggle-mode {
  color: var(--brand-primary);
  font-weight: 600;
  cursor: pointer;
}

.input-group {
  margin-bottom: 1.5rem;
}

.input-group input {
  width: 100%;
  padding: 1.2rem;
  border: 1px solid var(--border-medium);
  border-radius: 0; /* Swiggy has sharp inputs */
  font-size: 1rem;
  outline: none;
  transition: all var(--transition-fast);
  color: #1e1e1e;
  background-color: #f8f9fa;
  font-weight: 500;
}

.input-group input:focus {
  border-color: var(--brand-primary);
}

.submit-btn {
  width: 100%;
  padding: 1.2rem;
  background-color: var(--brand-primary);
  color: white;
  font-size: 1rem;
  font-weight: 600;
  text-transform: uppercase;
  border-radius: 0;
  margin-top: 1rem;
}

.submit-btn:hover {
  background-color: #e57317;
}

.submit-btn.loading {
  opacity: 0.8;
  cursor: not-allowed;
}

.policy-text {
  margin-top: 1.5rem;
  font-size: 0.8rem;
  color: var(--text-secondary);
  text-align: center;
}

@media (max-width: 900px) {
  .login-split {
    flex-direction: column;
  }
  
  .login-brand {
    display: none; /* Hide on mobile to focus on form */
  }
  
  .login-form-container {
    padding: 1.5rem;
  }
}
`;

if (typeof document !== "undefined") {
  const styleTag = document.createElement("style");
  styleTag.innerHTML = styles;
  document.head.appendChild(styleTag);
}