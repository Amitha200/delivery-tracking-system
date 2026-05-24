from django.urls import path, include
from users.views import register, LoginView, list_agents
from rest_framework.routers import DefaultRouter
from orders.views import OrderViewSet

router = DefaultRouter()
router.register(r'orders', OrderViewSet)

urlpatterns = [
    path("api/register/", register, name="register"),
    path("api/login/", LoginView.as_view(), name="login"),
    path("api/agents/", list_agents, name="list_agents"),
    path("api/", include(router.urls)),
]