from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated

from django.contrib.auth import get_user_model
from django.db import models
from django.db.models import Avg
from django.utils.timezone import now

from .models import Order, Notification
from .serializers import OrderSerializer, NotificationSerializer
from .utils import calculate_distance, traffic_factor

User = get_user_model()


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all().order_by("-created_at")
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    # 📦 CREATE ORDER
    def create(self, request, *args, **kwargs):
        try:
            data = request.data

            if not all([
                data.get("pickup_lat"),
                data.get("pickup_lng"),
                data.get("drop_lat"),
                data.get("drop_lng"),
            ]):
                return Response(
                    {"error": "All location fields are required"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            order = Order.objects.create(
                customer=request.user,
                item=data.get("item"),
                category=data.get("category"),
                shop_name=data.get("shop_name"),
                pickup_lat=data.get("pickup_lat"),
                pickup_lng=data.get("pickup_lng"),
                drop_lat=data.get("drop_lat"),
                drop_lng=data.get("drop_lng"),
                status="PENDING"
            )

            Notification.objects.create(
                user=request.user,
                message=f"Order #{order.id} created successfully"
            )

            return Response({
                "message": "Order created successfully",
                "order_id": order.id
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


    # 👨‍✈️ ASSIGN AGENT
    @action(detail=True, methods=['post'])
    def assign(self, request, pk=None):
        try:
            order = self.get_object()
            agent_id = request.data.get("agent_id")

            # ✅ Validate agent_id presence
            if not agent_id:
                return Response(
                    {"error": "agent_id is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # ✅ Validate agent_id is a number
            try:
                agent_id = int(agent_id)
            except (ValueError, TypeError):
                return Response(
                    {"error": "agent_id must be a valid number"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # ✅ Check agent exists
            agent = User.objects.filter(id=agent_id).first()
            if not agent:
                return Response(
                    {"error": f"No user found with ID {agent_id}"},
                    status=status.HTTP_404_NOT_FOUND
                )

            # ✅ Check user is actually an AGENT
            agent_role = getattr(agent, 'role', None)
            if not agent_role:
                return Response(
                    {"error": "User has no role assigned"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if agent_role.upper().strip() != "AGENT":
                return Response(
                    {"error": f"User #{agent_id} is not an agent (role: {agent_role})"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # ✅ Assign agent
            order.delivery_agent = agent
            order.status = "ASSIGNED"
            order.save()

            # ✅ Notify agent
            Notification.objects.create(
                user=agent,
                message=f"You have been assigned Order #{order.id}"
            )

            # ✅ Notify customer
            Notification.objects.create(
                user=order.customer,
                message=f"Your order #{order.id} has been assigned to a delivery agent"
            )

            return Response({
                "message": "Agent assigned successfully",
                "order_id": order.id,
                "agent_id": agent.id,
                "agent_name": agent.username,
                "status": order.status
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


    
    @action(detail=True, methods=['post'])
    def status(self, request, pk=None):
        order = self.get_object()
        new_status = request.data.get("status")

        allowed = ["PENDING", "ASSIGNED", "ACCEPTED", "DELIVERING", "DELIVERED"]

        if new_status not in allowed:
            return Response({"error": "Invalid status"}, status=400)
        
        # ✅ ACCEPT ORDER
        if new_status == "ACCEPTED":
            if order.status != "ASSIGNED":
                return Response({"error": "Can only accept ASSIGNED orders"}, status=400)

        # # 🚚 START DELIVERY
        # if new_status == "DELIVERING":
        #     if not order.started_at:
        #         order.started_at = now()

        #     distance = calculate_distance(
        #         order.pickup_lat,
        #         order.pickup_lng,
        #         order.drop_lat,
        #         order.drop_lng
        #     )

        #     traffic = traffic_factor()

        #     order.distance_km = distance
        #     order.traffic_factor = traffic
        #     order.estimated_time = distance * traffic * 10

        #  # 📦 DELIVERY COMPLETE
        # if new_status == "DELIVERED":
        #     order.delivered_at = now()

        #     if order.started_at:
        #         total_time = (
        #             order.delivered_at - order.started_at
        #         ).total_seconds() / 60

        #         order.actual_delivery_time = total_time

        # order.status = new_status
        # order.save()

        # # 🔔 Notifications
        # Notification.objects.create(
        #     user=order.customer,
        #     message=f"📦 Order #{order.id} is now {new_status}"
        # )

        # return Response({"status": order.status})

        # 🚚 START DELIVERY
        if new_status == "DELIVERING":
            if order.status != "ACCEPTED":                          # ← must accept first
                return Response({"error": "Must accept order before delivering"}, status=400)
            if not order.started_at:
                order.started_at = now()

            distance = calculate_distance(
                order.pickup_lat, order.pickup_lng,
                order.drop_lat, order.drop_lng
            )
            traffic = traffic_factor()
            order.distance_km = distance
            order.traffic_factor = traffic
            order.estimated_time = distance * traffic * 10

        # 📦 DELIVERY COMPLETE
        if new_status == "DELIVERED":
            if order.status != "DELIVERING":
                return Response({"error": "Order must be in DELIVERING state"}, status=400)
            order.delivered_at = now()
            if order.started_at:
                total_time = (order.delivered_at - order.started_at).total_seconds() / 60
                order.actual_delivery_time = total_time

        order.status = new_status
        order.save()

        Notification.objects.create(
            user=order.customer,
            message=f"📦 Order #{order.id} is now {new_status}"
        )

        return Response({"status": order.status})


    # 🚚 AGENT'S ORDERS
    @action(detail=False, methods=['get'])
    def agent_orders(self, request):
        try:
            orders = list(Order.objects.filter(delivery_agent=request.user))

        # 🚀 Sort by nearest drop location
            orders.sort(
                key=lambda o: calculate_distance(
                    o.current_lat or o.pickup_lat,
                    o.current_lng or o.pickup_lng,
                    o.drop_lat,
                    o.drop_lng
                )
            )

            serializer = self.get_serializer(orders, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=500)


    # 🛍️ CUSTOMER'S ORDERS
    @action(detail=False, methods=['get'])
    def my_orders(self, request):
        try:
            orders = Order.objects.filter(customer=request.user).order_by("-created_at")
            serializer = self.get_serializer(orders, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


    # 🔔 NOTIFICATIONS
    @action(detail=False, methods=['get'])
    def notifications(self, request):
        try:
            notes = Notification.objects.filter(
                user=request.user
            ).order_by("-created_at")

            serializer = NotificationSerializer(notes, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


    # 📊 REPORT
    @action(detail=False, methods=['get'])
    def report(self, request):
        try:
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

        except Exception as e:
            return Response({"error": str(e)}, status=500)

    # ⏱️ ESTIMATE DELIVERY
    @action(detail=True, methods=['get'])
    def estimate(self, request, pk=None):
        try:
            order = self.get_object()

            distance = calculate_distance(
                order.pickup_lat,
                order.pickup_lng,
                order.drop_lat,
                order.drop_lng
            )

            traffic = traffic_factor()
            estimated_time = distance * traffic * 10

            # 🔥 Save values
            order.distance_km = distance
            order.traffic_factor = traffic
            order.estimated_time = estimated_time
            order.save()

            return Response({
                "order_id": order.id,
                "distance_km": round(distance, 2),
                "traffic_factor": round(traffic, 2),
                "estimated_time_minutes": round(estimated_time, 2)
            })

        except Exception as e:
            return Response({"error": str(e)}, status=500)

    
    @action(detail=True, methods=['post'])
    def update_location(self, request, pk=None):
        order = self.get_object()

        lat = request.data.get("lat")
        lng = request.data.get("lng")

        if lat is None or lng is None:
            return Response({"error": "lat/lng required"}, status=400)

        order.current_lat = float(lat)
        order.current_lng = float(lng)

        # 📏 Distance to destination
        distance_to_drop = calculate_distance(
            order.current_lat,
            order.current_lng,
            order.drop_lat,
            order.drop_lng
        )

        # 🚀 AUTO DELIVERY
        if distance_to_drop < 0.1 and order.status != "DELIVERED":
            order.status = "DELIVERED"
            order.delivered_at = now()

            if order.started_at:
                total_time = (
                    order.delivered_at - order.started_at
                ).total_seconds() / 60

                order.actual_delivery_time = total_time

            # 🔔 Notify customer
            Notification.objects.create(
                user=order.customer,
                message=f"📦 Order #{order.id} delivered successfully"
            )

        order.save()

        return Response({
            "message": "Location updated",
            "distance_km": round(distance_to_drop, 3),
            "status": order.status
        })