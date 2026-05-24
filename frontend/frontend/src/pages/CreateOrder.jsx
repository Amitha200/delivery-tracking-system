import { useState } from "react";
import axios from "axios";

function CreateOrder() {
  const [message, setMessage] = useState("");

  const createOrder = async () => {
    const token = localStorage.getItem("token");

    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/api/orders/create/",
        {
          pickup_lat: 9.9312,
          pickup_lng: 76.2673,
          drop_lat: 9.9350,
          drop_lng: 76.2750,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage("Order Created ✅");
      console.log(res.data);
    } catch (err) {
      console.error(err);
      setMessage("Error creating order ❌");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Create Order</h2>

      <button onClick={createOrder}>Create Order</button>

      <p>{message}</p>
    </div>
  );
}

export default CreateOrder;