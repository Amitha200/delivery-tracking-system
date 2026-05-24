import json
from channels.generic.websocket import AsyncWebsocketConsumer


class TrackingConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.order_id = self.scope["url_route"]["kwargs"]["order_id"]

        # 🔥 Group name (IMPORTANT)
        self.group_name = f"order_{self.order_id}"

        # 🔗 Join group
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )

        await self.accept()
        print(f"✅ Connected to order {self.order_id}")

    async def disconnect(self, close_code):
        # ❌ Leave group
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )
        print(f"❌ Disconnected from {self.order_id}")

    # 🔥 RECEIVE DATA FROM CLIENT (AGENT)
    async def receive(self, text_data):
        data = json.loads(text_data)

        lat = data.get("lat")
        lng = data.get("lng")
        status = data.get("status")

        # 📡 Broadcast to ALL (customer + admin)
        await self.channel_layer.group_send(
            self.group_name,
            {
                "type": "send_tracking",
                "lat": lat,
                "lng": lng,
                "status": status
            }
        )

    # 🔥 SEND TO FRONTEND
    async def send_tracking(self, event):
        await self.send(text_data=json.dumps({
            "lat": event.get("lat"),
            "lng": event.get("lng"),
            "status": event.get("status")
        }))