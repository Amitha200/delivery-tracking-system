# from django.contrib import admin
# from django.urls import path, include
# from users.views import LoginView   # ✅ your custom role-based login

# urlpatterns = [
#     path('admin/', admin.site.urls),
#     path('api/users/', include('users.urls')),
#     path('api/', include('orders.urls')),
#     path('api/login/', LoginView.as_view()),
# ]

from django.contrib import admin
from django.urls import path, include
from users.views import LoginView, register

urlpatterns = [
    path('admin/', admin.site.urls),

    path('api/users/', include('users.urls')),
    path('api/orders/', include('orders.urls')),

    # ✅ ONLY THIS (REMOVE default jwt one)
    path('api/login/', LoginView.as_view()),
    path('api/register/', register),
    path("api/reports/", include("reports.urls")),
]