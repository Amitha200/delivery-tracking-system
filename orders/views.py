from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Order

@api_view(['POST'])
def create_order(request):
    order = Order.objects.create(
        customer=request.user,
        pickup=request.data['pickup'],
        delivery=request.data['delivery']
    )
    return Response({"message": "Order created", "order_id": order.id})


@api_view(['PUT'])
def assign_agent(request, id):
    order = Order.objects.get(id=id)
    order.agent_id = request.data['agent_id']
    order.save()
    return Response({"message": "Agent assigned"})


@api_view(['PUT'])
def update_status(request, id):
    order = Order.objects.get(id=id)
    order.status = request.data['status']
    order.save()
    return Response({"message": "Status updated"})