from rest_framework import serializers
from .models import User
from dashboard.models import StaffProfile
    
from rest_framework.exceptions import AuthenticationFailed
from django.utils import timezone
from rest_framework_simplejwt.tokens import RefreshToken

from config.core.redis_client import redis_client
from config.core.services.otp_service import MAX_LOGIN_ATTEMPTS, LOGIN_ATTEMPT_EXPIRY

from dashboard.permissions.utils import (
    get_user_permissions
)

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["email","password","role"]

    # def create(self, validated_data):
    #     password = validated_data.pop("password")

    #     user = User(**validated_data)

    #     user.set_password(password)

    #     user.save()

    #     return user
    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get("email")
        password = data.get("password")

        attempts_key = f"login_attempts:{email}"
        attempts = redis_client.get(attempts_key)

        if attempts and int(attempts) >= MAX_LOGIN_ATTEMPTS:
            raise AuthenticationFailed({
                    "detail": "Too many attempts. Try again later",
                    "code": "too_many_attempts"
                })

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise AuthenticationFailed({
                        "detail": "Invalid email",
                        "code": "invalid_email"
                    })
        
        
        if not user.check_password(password):

            new_attempts = redis_client.incr(attempts_key)

            if new_attempts == 1:
                redis_client.expire(attempts_key,LOGIN_ATTEMPT_EXPIRY)

            raise AuthenticationFailed({
                        "detail": "Invalid email or password",
                        "code": "invalid_credentials"
                    })
          
        
        redis_client.delete(attempts_key)
        
        if not user.is_active:
            raise AuthenticationFailed({
                "detail": "Account disabled",
                "code": "account_disabled"
            })

        if not user.is_verified:
            raise AuthenticationFailed({
                "detail": "Account not verified",
                "code": "not_verified"
            })
        
        user.last_login = timezone.now()

        user.save(update_fields=["last_login"])

        # updated edited part for adding cookies
        #-----------------------------------------
        return {"user": user}

        #old part when we used to store token in local storage

        # refresh = RefreshToken.for_user(user)

        # return {
        #     "access": str(refresh.access_token),
        #     "refresh": str(refresh),
        #     "user": {
        #         "email": user.email,
        #         "role":user.role,
        #         "is_verified": user.is_verified,
        #     }
        # }
    


class UserSerializer(serializers.ModelSerializer):

    staff_profile = serializers.SerializerMethodField()

    class Meta:

        model = User

        fields = [
            "id",
            "email",
            "role",
            "is_verified",
            "is_staff",
            "staff_profile",
        ]

    def get_staff_profile(self, obj):

        if not obj.is_staff:
            return None

        try:

            staff_profile = obj.staff_profile

            return {

                "role":
                    staff_profile.role,

                "job_title":
                    staff_profile.job_title,

                "department":
                    staff_profile.department,

                "phone_number":
                    staff_profile.phone_number,

                "is_active_staff":
                    staff_profile.is_active_staff,

                "permissions":
                    list(
                        get_user_permissions(obj)
                    ),
            }

        except StaffProfile.DoesNotExist:

            return None



# class UserSerializer(serializers.ModelSerializer):

#     staff_profile = serializers.SerializerMethodField()

#     class Meta:
#         model = User

#         fields = [
#             "id",
#             "email",
#             "role",
#             "is_verified",
#             "is_staff",
#             "staff_profile",
#         ]

#     def get_staff_profile(self, obj):

#         if not obj.is_staff:
#             return None

#         try:

#             staff_profile = obj.staff_profile

#             return {
#                 "role": staff_profile.role,

#                 "job_title":
#                     staff_profile.job_title,

#                 "department":
#                     staff_profile.department,

#                 "phone_number":
#                     staff_profile.phone_number,

#                 "is_active_staff":
#                     staff_profile.is_active_staff,
#             }

#         except StaffProfile.DoesNotExist:

#             return None


# class LogoutSerializer(serializers.Serializer):
#     refresh = serializers.CharField()

#     def validate(self, attrs):
#         refresh_token = attrs["refresh"]

#         try:
#             token = RefreshToken(refresh_token)
#             token.blacklist()
#         except Exception:
#             raise serializers.ValidationError({
#                         "detail": "Invalid or expired token",
#                         "code": "token_expired"
#                     })
#         return attrs



class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)

class ResendOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()

class VerifyResetOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)

class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()
    new_password = serializers.CharField(write_only=True)



