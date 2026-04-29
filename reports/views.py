from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Avg

from orders.models import Order
from django.contrib.auth import get_user_model

User = get_user_model()


# 📊 ADMIN SUMMARY REPORT
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_report(request):
    orders = Order.objects.all()

    total = orders.count()
    delivered = orders.filter(status="DELIVERED").count()

    success_rate = (delivered / total) * 100 if total > 0 else 0

    avg_time = orders.filter(
        actual_delivery_time__isnull=False
    ).aggregate(avg=Avg("actual_delivery_time"))["avg"]

    return Response({
        "total_orders": total,
        "delivered_orders": delivered,
        "success_rate": round(success_rate, 2),
        "average_delivery_time_minutes": round(avg_time, 2) if avg_time else 0
    })


# 🚚 AGENT PERFORMANCE REPORT
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def agent_report(request):
    agents = User.objects.filter(role="AGENT")

    data = []

    for agent in agents:
        orders = Order.objects.filter(delivery_agent=agent)

        total = orders.count()
        delivered = orders.filter(status="DELIVERED").count()

        avg_time = orders.filter(
            actual_delivery_time__isnull=False
        ).aggregate(avg=Avg("actual_delivery_time"))["avg"]

        data.append({
            "agent": agent.username,
            "total_orders": total,
            "delivered_orders": delivered,
            "average_time": round(avg_time, 2) if avg_time else 0
        })

    return Response(data)