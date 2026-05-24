from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers


class CustomTokenSerializer(TokenObtainPairSerializer):

    def validate(self, attrs):
        data = super().validate(attrs)

        # SAFE access after super()
        user = self.user

        # OPTIONAL ROLE CHECK (frontend-controlled, use carefully)
        request = self.context.get("request", None)

        if request:
            requested_role = request.data.get("role")

            if requested_role and user.role != requested_role:
                raise serializers.ValidationError("Role mismatch")

        # CUSTOM RESPONSE FORMAT
        data["user"] = {
            "id": user.id,
            "username": user.username,
            "role": user.role,
        }

        return data