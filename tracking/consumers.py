import json
from channels.generic.websocket import AsyncWebsocketConsumer


class TrackingConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        # When client connects
        print("✅ WebSocket CONNECTED")
        await self.accept()

    async def disconnect(self, close_code):
        # When client disconnects
        print("❌ WebSocket DISCONNECTED")

    async def receive(self, text_data):
        # When data is received from client
        print("📩 Data received:", text_data)

        data = json.loads(text_data)

        lat = data.get('lat')
        lng = data.get('lng')

        # Send data back to client (echo)
        await self.send(text_data=json.dumps({
            'lat': lat,
            'lng': lng
        }))