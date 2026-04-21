from django.urls import path
from .views import create_order, assign_agent, update_status

urlpatterns = [
    path('create/', create_order),
    path('assign/<int:id>/', assign_agent),
    path('status/<int:id>/', update_status),
]