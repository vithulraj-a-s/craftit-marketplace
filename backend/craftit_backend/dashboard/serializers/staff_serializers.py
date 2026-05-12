from rest_framework import serializers
from users.models import User
from dashboard.models import StaffProfile

class StaffProfileSerializer(serializers.ModelSerializer):

    class Meta:
        model = StaffProfile
        fields = [
            "full_name",
            "role",
            "job_title",
            "phone_number",
            "department",
            "is_active_staff",
        ]

class StaffCreateSerializer(serializers.Serializer):

    full_name = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    role = serializers.ChoiceField(
        choices=StaffProfile.ROLE_CHOICES
    )

    job_title = serializers.CharField()
    phone_number = serializers.CharField()
    department = serializers.CharField()

    def create(self, validated_data):

        full_name = validated_data.pop("full_name")
        role = validated_data.pop("role")
        job_title = validated_data.pop("job_title")
        phone_number = validated_data.pop("phone_number")
        department = validated_data.pop("department")

        password = validated_data.pop("password")

        user = User.objects.create(
            email=validated_data["email"],
            is_staff=True,
            is_active=True,
            is_verified=True,
        )

        user.set_password(password)
        user.save()

        StaffProfile.objects.create(
            user=user,
            full_name=full_name,
            role=role,
            job_title=job_title,
            phone_number=phone_number,
            department=department,
            is_active_staff=True,
        )

        return user
    
class StaffUpdateSerializer(serializers.Serializer):

    role = serializers.ChoiceField(
        choices=StaffProfile.ROLE_CHOICES,
        required=False
    )

    full_name = serializers.CharField(required=False)    

    job_title = serializers.CharField(required=False)

    phone_number = serializers.CharField(required=False)

    department = serializers.CharField(required=False)

    is_active_staff = serializers.BooleanField(required=False)

    email = serializers.EmailField(required=False)

    password = serializers.CharField(
        write_only=True,
        required=False
    )

    def update(self, instance, validated_data):

        password = validated_data.pop(
            "password",
            None
        )

        email = validated_data.pop(
            "email",
            None
        )

        if email:
            instance.email = email

        instance.save()

        staff_profile = instance.staff_profile

        for attr, value in validated_data.items():

            setattr(
                staff_profile,
                attr,
                value
            )

        staff_profile.save()

        if password:

            instance.set_password(password)
            instance.save()

        return instance
    
class StaffListSerializer(serializers.ModelSerializer):

    staff_profile = StaffProfileSerializer()

    class Meta:
        model = User

        fields = [
            "id",
            "email",
            "is_active",
            "created_at",
            "staff_profile",
        ]