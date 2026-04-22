from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import User
from rest_framework_simplejwt.views import TokenObtainPairView

@api_view(['POST'])
def register(request):
    user = User.objects.create_user(
        username=request.data['username'],
        password=request.data['password'],
        role=request.data['role']
    )
    return Response({"message": "User created"})

class LoginView(TokenObtainPairView):
    pass