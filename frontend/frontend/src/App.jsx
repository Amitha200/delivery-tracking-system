// import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// import Login from "./pages/Login";
// import Dashboard from "./pages/Dashboard";
// import AdminOrders from "./pages/AdminOrders";
// import CreateOrder from "./pages/CreateOrder";
// import LiveTracking from "./pages/LiveTracking";
// import AgentDashboard from "./pages/AgentDashboard";
// import CustomerDashboard from "./pages/CustomerDashboard";
// import Notifications from "./pages/Notifications";
// import Report from "./pages/Report";

// function App() {
//   return (
//     <Router>
//       <Routes>

//         {/* 🔐 Login */}
//         <Route path="/" element={<Login />} />

//         {/* 📊 Dashboard */}
//         <Route path="/dashboard" element={<Dashboard />} />

//         {/* ✅ FIX: ADD THIS */}
//         <Route path="/admin" element={<AdminOrders />} />

//         {/* 📦 Admin Orders */}
//         <Route path="/admin/orders" element={<AdminOrders />} />

//         {/* ➕ Create Order */}
//         <Route path="/create-order" element={<CreateOrder />} />

//         {/* 🚚 Live Tracking */}
//         <Route path="/tracking/:orderId" element={<LiveTracking />} />

//         {/* ⚠️ Redirect */}
//         <Route path="/tracking" element={<Navigate to="/admin/orders" />} />

//         {/* 👤 Roles */}
//         <Route path="/agent" element={<AgentDashboard />} />
//         <Route path="/customer" element={<CustomerDashboard />} />

//         {/* 🔔 Extras */}
//         <Route path="/notifications" element={<Notifications />} />
//         <Route path="/report" element={<Report />} />

//       </Routes>
//     </Router>
//   );
// }

// export default App;

import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AdminOrders from "./pages/AdminOrders";
import CreateOrder from "./pages/CreateOrder";
import LiveTracking from "./pages/LiveTracking";
import AgentDashboard from "./pages/AgentDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";
import Notifications from "./pages/Notifications";
import Report from "./pages/Report";


// 🔐 AUTH PROTECTION
function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/" />;
}


// 📍 WRAPPER FOR TRACKING PARAM
function LiveTrackingWrapper() {
  const { orderId } = useParams();
  return <LiveTracking orderId={orderId} />;
}


function App() {
  return (
    <Router>
      <Routes>

        {/* 🔐 LOGIN */}
        <Route path="/" element={<Login />} />

        {/* 📊 DASHBOARD */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        {/* 🛠️ ADMIN */}
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <AdminOrders />
            </PrivateRoute>
          }
        />

        <Route
          path="/admin/orders"
          element={
            <PrivateRoute>
              <AdminOrders />
            </PrivateRoute>
          }
        />

        {/* ➕ CREATE ORDER */}
        <Route
          path="/create-order"
          element={
            <PrivateRoute>
              <CreateOrder />
            </PrivateRoute>
          }
        />

        {/* 🚚 LIVE TRACKING */}
        <Route
          path="/tracking/:orderId"
          element={
            <PrivateRoute>
              <LiveTrackingWrapper />
            </PrivateRoute>
          }
        />

        {/* ⚠️ FALLBACK */}
        <Route path="/tracking" element={<Navigate to="/admin/orders" />} />

        {/* 👤 AGENT */}
        <Route
          path="/agent"
          element={
            <PrivateRoute>
              <AgentDashboard />
            </PrivateRoute>
          }
        />

        {/* 👤 CUSTOMER */}
        <Route
          path="/customer"
          element={
            <PrivateRoute>
              <CustomerDashboard />
            </PrivateRoute>
          }
        />

        {/* 🔔 NOTIFICATIONS */}
        <Route
          path="/notifications"
          element={
            <PrivateRoute>
              <Notifications />
            </PrivateRoute>
          }
        />

        {/* 📊 REPORT */}
        <Route
          path="/report"
          element={
            <PrivateRoute>
              <Report />
            </PrivateRoute>
          }
        />

        {/* ❌ UNKNOWN ROUTE */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </Router>
  );
}

export default App;