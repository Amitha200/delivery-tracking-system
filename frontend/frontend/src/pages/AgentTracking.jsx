import { useEffect } from "react";
import axios from "axios";

function AgentTracking({ orderId }) {
  const token = localStorage.getItem("token");

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        await axios.post(
          `http://127.0.0.1:8000/api/orders/${orderId}/update_location/`,
          { lat, lng },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
      },
      (err) => console.error(err),
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [orderId]);

  return <h3>📡 Sharing Live Location...</h3>;
}

export default AgentTracking;