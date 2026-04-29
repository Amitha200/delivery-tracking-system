from django.urls import path, include
from users.views import register, LoginView
from rest_framework.routers import DefaultRouter
from orders.views import OrderViewSet

router = DefaultRouter()
router.register(r'orders', OrderViewSet)

urlpatterns = [
    path("api/register/", register, name="register"),
    path("api/login/", LoginView.as_view(), name="login"),
    path("api/", include(router.urls)),
]