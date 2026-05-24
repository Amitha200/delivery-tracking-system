from django.db import models
from django.conf import settings
from django.utils.timezone import now
import math

User = settings.AUTH_USER_MODEL


class Order(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('ASSIGNED', 'Assigned'),
        ('ACCEPTED', 'Accepted'),
        ('DELIVERING', 'Delivering'),
        ('DELIVERED', 'Delivered'),
    ]

    # 👤 Customer
    customer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="customer_orders"
    )

    # 🚚 Delivery Agent
    delivery_agent = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="agent_orders"
    )

    # 📦 Item details
    item = models.CharField(max_length=255)
    category = models.CharField(max_length=100, null=True, blank=True)
    shop_name = models.CharField(max_length=255, null=True, blank=True)

    # 📍 Locations
    pickup_lat = models.FloatField()
    pickup_lng = models.FloatField()
    drop_lat = models.FloatField()
    drop_lng = models.FloatField()

    # 🚦 Status
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='PENDING'
    )

    # 🕒 Time tracking
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    started_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)

    # 📍 Live tracking
    current_lat = models.FloatField(null=True, blank=True)
    current_lng = models.FloatField(null=True, blank=True)

    # 📊 Analytics
    distance_km = models.FloatField(null=True, blank=True)
    traffic_factor = models.FloatField(default=1.0)
    estimated_time = models.FloatField(null=True, blank=True)
    actual_delivery_time = models.FloatField(null=True, blank=True)

    # ==============================
    # 🔥 CORE LOGIC METHODS
    # ==============================

    def calculate_distance(self):
        """
        Haversine formula for distance in KM
        """
        R = 6371

        lat1 = math.radians(self.pickup_lat)
        lon1 = math.radians(self.pickup_lng)
        lat2 = math.radians(self.drop_lat)
        lon2 = math.radians(self.drop_lng)

        dlat = lat2 - lat1
        dlon = lon2 - lon1

        a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))

        return round(R * c, 2)

    def set_estimation(self):
        """
        Set distance + estimated delivery time
        """
        self.distance_km = self.calculate_distance()

        # traffic simulation (1.0 to 1.5)
        self.traffic_factor = round(1 + (0.5 * (math.sin(self.id or 1))), 2)

        # assume 30 km/h avg speed
        if self.distance_km:
            self.estimated_time = round(
                (self.distance_km / 30) * 60 * self.traffic_factor,
                2
            )

    def mark_started(self):
        if not self.started_at:
            self.started_at = now()

    def mark_delivered(self):
        self.status = "DELIVERED"
        self.delivered_at = now()

        if self.started_at:
            duration = (self.delivered_at - self.started_at).total_seconds() / 60
            self.actual_delivery_time = round(duration, 2)

    def __str__(self):
        return f"Order #{self.id} - {self.item} - {self.status}"


# ==============================
# 🔔 NOTIFICATIONS
# ==============================
class Notification(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="order_notifications"
    )

    message = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)

    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user} - {self.message[:40]}"