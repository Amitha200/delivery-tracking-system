from django.db import models
from users.models import User

class Order(models.Model):
    customer = models.ForeignKey(User, on_delete=models.CASCADE)
    agent = models.ForeignKey(User, null=True, blank=True,
                              on_delete=models.SET_NULL,
                              related_name='orders')

    status = models.CharField(max_length=20, default='PLACED')

    pickup = models.CharField(max_length=255)
    delivery = models.CharField(max_length=255)

    created_at = models.DateTimeField(auto_now_add=True)