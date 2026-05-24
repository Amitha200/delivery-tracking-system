from django.urls import path
from .views import admin_report, agent_report

urlpatterns = [
    path("admin-report/", admin_report),
    path("agent-report/", agent_report),
]