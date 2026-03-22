from rest_framework import serializers
from .models import User
    
from rest_framework.exceptions import AuthenticationFailed
from django.utils import timezone
from rest_framework_simplejwt.tokens import RefreshToken

from config.core.redis_client import redis_client
from config.core.services.otp_service import MAX_LOGIN_ATTEMPTS, LOGIN_ATTEMPT_EXPIRY


# this is the serializer for registration
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
    # Instead of manually popping and hashing, 
    # just pass everything to your manager's helper!
        return User.objects.create_user(**validated_data)


class LoginSerializer(serializers.Serializer): # serializer for login using email and password
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get("email")
        password = data.get("password")

        attempts_key = f"login_attempts:{email}"
        attempts = redis_client.get(attempts_key)

        if attempts and int(attempts) >= MAX_LOGIN_ATTEMPTS:
            raise AuthenticationFailed("Too many attempts. Try again later")

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise AuthenticationFailed("Invalid credentials")
        
        
        if not user.check_password(password):

            new_attempts = redis_client.incr(attempts_key)

            if new_attempts == 1:
                redis_client.expire(attempts_key,LOGIN_ATTEMPT_EXPIRY)

            raise AuthenticationFailed("Invalid credentials")
        
        redis_client.delete(attempts_key)
        
        if not user.is_active:
            raise AuthenticationFailed("Account disabled")

        if not user.is_verified:
            raise AuthenticationFailed("Account not verified. Please verify! ")
        
        user.last_login = timezone.now()

        user.save(update_fields=["last_login"])

        refresh = RefreshToken.for_user(user)


        return {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": {
                "email": user.email,
                "role":user.role,
                "is_verified": user.is_verified,
            }
        }
    

class UserSerializer(serializers.ModelSerializer): # serializer for creating meView and auth/me/ endpoint

    class Meta:
        model = User
        fields = ["email","role","is_verified"]


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()

    def validate(self, attrs):
        # attrs is the dict that contains the "refresh":"gdgdhsb3424.hushsd.ahuha"
        refresh_token = attrs["refresh"] # here we access the refresh keyword

        try:
            token = RefreshToken(refresh_token) # here we change it to a object
            token.blacklist()
        except Exception:
            raise serializers.ValidationError("Invalid or expired token")
        
        return attrs



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