from rest_framework import serializers

from users.models import User


class UserListSerializer(serializers.ModelSerializer):

    class Meta:
        model = User

        fields = [
            "id",
            "email",
            "role",
            "is_verified",
            "is_active",
            "created_at",
        ]

class UserUpdateSerializer(serializers.Serializer):

    is_active = serializers.BooleanField(
        required=False
    )

    is_verified = serializers.BooleanField(
        required=False
    )

    def update(self, instance, validated_data):

        for attr, value in validated_data.items():

            setattr(
                instance,
                attr,
                value
            )

        instance.save()

        return instance