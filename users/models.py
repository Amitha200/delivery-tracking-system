from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):

    class Roles(models.TextChoices):
        ADMIN = "ADMIN", "Admin"
        CUSTOMER = "CUSTOMER", "Customer"
        AGENT = "AGENT", "Agent"

    role = models.CharField(
        max_length=10,
        choices=Roles.choices,
        default=Roles.CUSTOMER
    )

    def is_admin(self):
        return self.role == self.Roles.ADMIN

    def is_agent(self):
        return self.role == self.Roles.AGENT

    def is_customer(self):
        return self.role == self.Roles.CUSTOMER