from rest_framework import serializers
from .models import Order, Notification


# ================= ORDER SERIALIZER =================
class OrderSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source="customer.username", read_only=True)
    agent_name = serializers.CharField(source="delivery_agent.username", read_only=True)

    class Meta:
        model = Order
        fields = [
            "id",

            # 👤 Users
            "customer",
            "customer_name",
            "delivery_agent",
            "agent_name",

            # 📦 Order details
            "item",
            "category",
            "shop_name",

            # 📍 Locations
            "pickup_lat",
            "pickup_lng",
            "drop_lat",
            "drop_lng",
            "current_lat",
            "current_lng",

            # 🚦 Status
            "status",

            # ⏱️ Time
            "created_at",
            "updated_at",
            "started_at",
            "delivered_at",

            # 📊 Analytics
            "distance_km",
            "traffic_factor",
            "estimated_time",
            "actual_delivery_time",
        ]

        read_only_fields = [
            "customer",
            "created_at",
            "updated_at",
            "started_at",
            "delivered_at",
            "distance_km",
            "traffic_factor",
            "estimated_time",
            "actual_delivery_time",
        ]


# ================= NOTIFICATION SERIALIZER =================
class NotificationSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = Notification
        fields = [
            "id",
            "user",
            "user_name",
            "message",
            "created_at",
            "is_read",
        ]