from django.db import models
from orders.models import Order

class Location(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    lat = models.FloatField()
    lng = models.FloatField()
    timestamp = models.DateTimeField(auto_now_add=True)