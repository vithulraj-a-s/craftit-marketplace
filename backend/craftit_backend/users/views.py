from django.shortcuts import render
from rest_framework import generics
from .models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated,AllowAny
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer, VerifyOTPSerializer, ResendOTPSerializer, ForgotPasswordSerializer, ResetPasswordSerializer, VerifyResetOTPSerializer
from config.core.services.otp_service import verify_otp,send_otp
from config.core.services.password_service import send_reset_otp, verify_reset_otp
from config.core.services.email_service import send_welcome_email
from config.core.redis_client import redis_client
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.tokens import RefreshToken


class RegisterView(generics.CreateAPIView):
    permission_classes = [AllowAny]
    queryset = User.objects.all()

    serializer_class = RegisterSerializer

    def perform_create(self, serializer):
        user = serializer.save(is_verified=False)

        send_otp(user.email)




class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data["user"]

        refresh = RefreshToken.for_user(user)
        refresh["role"] = user.role
        refresh["email"] = user.email

        access_token = str(refresh.access_token)
        refresh_token = str(refresh)

        response = Response({
            "user": {
                "email": user.email,
                "role": user.role,
                "is_verified": user.is_verified,
            }
        }, status=status.HTTP_200_OK)

        
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            secure=False,   
            samesite="Lax",
        )

        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            secure=False,
            samesite="Lax",
        )

        return response
    
class CookieTokenRefreshView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        refresh_token = request.COOKIES.get("refresh_token")

        if not refresh_token:
            raise AuthenticationFailed("No refresh token")

        try:
            refresh = RefreshToken(refresh_token)
            access_token = str(refresh.access_token)
        except Exception:
            raise AuthenticationFailed("Invalid refresh token")

        response = Response({"message": "Token refreshed"})

        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            secure=False,   # True in production
            samesite="Lax",
        )

        return response
    
class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)

        return Response(serializer.data)
    
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.COOKIES.get("refresh_token")

        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except Exception:
                pass  # ignore invalid token

        response = Response({
            "detail": "Logged out successfully",
            "code": "logged_out"
        })

        # 🔥 Delete cookies
        response.delete_cookie("access_token")
        response.delete_cookie("refresh_token")

        return response
    
class VerifyOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self,request):
        serializer = VerifyOTPSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        email = serializer.validated_data["email"]
        otp = serializer.validated_data["otp"]

        # success, message = verify_otp(email,otp)

        # if not success:
        #     return Response({
        #         "detail": message,
        #         "code": "invalid_otp"
        #         },status=status.HTTP_400_BAD_REQUEST)
        success, response = verify_otp(email, otp)

        if not success:
            return Response(response, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user=User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({
                    "detail": "User not found",
                    "code": "user_not_found"
                },status=status.HTTP_404_NOT_FOUND)
        
        if user.is_verified:
            return Response({
                    "detail": "Account already verified",
                    "code": "already_verified"
                },status=status.HTTP_400_BAD_REQUEST)
        
        user.is_verified = True
        user.save()

        send_welcome_email(user.email)

        return Response({
                "deatil": "OTP verified successfully",
                "code":"otp verified"
            },status=status.HTTP_200_OK)
    


class ResendOTPView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = ResendOTPSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        email = serializer.validated_data["email"]

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"detail": "User not found","code":"user not found"}, status=status.HTTP_404_NOT_FOUND)
        
        if user.is_verified:
            return Response({"detail":"The account is already verified","code":"already verified"},status=status.HTTP_400_BAD_REQUEST)

        success,message = send_otp(email) 

        if not success:
            return Response(
                message,status=status.HTTP_400_BAD_REQUEST
            )
        
        return Response({"detail": "OTP resent","code":"otp resent"}, status=status.HTTP_200_OK)
    
class ForgetPasswordView(APIView):
    permission_classes = [AllowAny]
    def post(self,request):
        serializer = ForgotPasswordSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
        
        email=serializer.validated_data["email"]

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"detail":"If account exists, OTP sent","code":"account doesnt exist"}, status=status.HTTP_200_OK)
        
        send_reset_otp(email)

        return Response({"detail":"if accounts exists, OTP sent","code":"otp sent"},status=status.HTTP_200_OK)
    

class VerifyResetOTPView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = VerifyResetOTPSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        email = serializer.validated_data["email"]
        otp = serializer.validated_data["otp"]

        success, message = verify_reset_otp(email, otp)

        if not success:
            return Response(message, status=status.HTTP_400_BAD_REQUEST)

        return Response(message, status=status.HTTP_200_OK)
    
class ResetPasswordView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        email = serializer.validated_data["email"]
        new_password = serializer.validated_data["new_password"]

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"detail": "User not found","code":"user not found"}, status=404)
        
        verified_key = f"reset_verified:{email}"

        if not redis_client.get(verified_key):
            return Response({"detail":"OTP verification required","code":"otp required"}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()

        redis_client.delete(verified_key)

        return Response({"detail": "Password reset successful","code":"reset successful"}, status=200)