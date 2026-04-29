# from rest_framework.decorators import api_view
# from rest_framework.response import Response
# from rest_framework import status
# from .models import User
# from rest_framework_simplejwt.views import TokenObtainPairView
# from .serializers import CustomTokenSerializer


# @api_view(['POST'])
# def register(request):
#     try:
#         username = request.data.get("username")
#         password = request.data.get("password")
#         role = request.data.get("role", "CUSTOMER")

#         # validation
#         if not username or not password:
#             return Response(
#                 {"error": "Username and password required"},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

#         # role validation
#         if role not in ["ADMIN", "AGENT", "CUSTOMER"]:
#             return Response(
#                 {"error": "Invalid role"},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

#         # prevent admin creation from frontend
#         if role == "ADMIN":
#             return Response(
#                 {"error": "Cannot create admin from registration"},
#                 status=status.HTTP_403_FORBIDDEN
#             )

#         # duplicate check
#         if User.objects.filter(username=username).exists():
#             return Response(
#                 {"error": "Username already exists"},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

#         # create user
#         user = User.objects.create_user(
#             username=username,
#             password=password,
#             role=role
#         )

#         return Response(
#             {
#                 "message": "User created successfully",
#                 "user": {
#                     "username": user.username,
#                     "role": user.role
#                 }
#             },
#             status=status.HTTP_201_CREATED
#         )

#     except Exception as e:
#         return Response(
#             {"error": str(e)},
#             status=status.HTTP_500_INTERNAL_SERVER_ERROR
#         )


# # ✅ JWT LOGIN VIEW (KEEP THIS - DO NOT CHANGE LOGIC)
# class LoginView(TokenObtainPairView):
#     serializer_class = CustomTokenSerializer

from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.db import transaction
from .models import User
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenSerializer

@api_view(['POST'])
@permission_classes([AllowAny])  # Explicitly allow anyone to register
def register(request):
    """
    Handles user registration with role-based validation.
    """
    # 1. Use .get() with defaults for cleaner data extraction
    data = request.data
    username = data.get("username")
    password = data.get("password")
    role = data.get("role", "CUSTOMER").upper()  # Ensure consistency in casing

    # 2. Basic Field Validation
    if not username or not password:
        return Response(
            {"error": "Username and password are required."},
            status=status.HTTP_400_BAD_REQUEST
        )

    # 3. Role Validation
    valid_roles = ["ADMIN", "AGENT", "CUSTOMER"]
    if role not in valid_roles:
        return Response(
            {"error": f"Invalid role. Choose from {', '.join(valid_roles)}."},
            status=status.HTTP_400_BAD_REQUEST
        )

    # 4. Security: Prevent unauthorized Admin creation
    if role == "ADMIN":
        return Response(
            {"error": "Administrative accounts cannot be created via public registration."},
            status=status.HTTP_403_FORBIDDEN
        )

    # 5. Duplicate Check
    if User.objects.filter(username=username).exists():
        return Response(
            {"error": "A user with that username already exists."},
            status=status.HTTP_400_BAD_REQUEST
        )

    # 6. Atomic User Creation
    try:
        with transaction.atomic():  # Ensures database integrity
            user = User.objects.create_user(
                username=username,
                password=password,
                role=role
            )
        
        return Response(
            {
                "message": "User created successfully.",
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "role": user.role
                }
            },
            status=status.HTTP_201_CREATED
        )

    except Exception as e:
        # Avoid leaking raw system errors to the frontend in production
        return Response(
            {"error": "An internal server error occurred during registration."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

# ✅ JWT LOGIN VIEW (Unchanged as requested)
class LoginView(TokenObtainPairView):
    serializer_class = CustomTokenSerializer