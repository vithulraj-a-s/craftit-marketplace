from django.shortcuts import render
from rest_framework import generics
from .models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated,AllowAny
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer, LogoutSerializer, VerifyOTPSerializer, ResendOTPSerializer, ForgotPasswordSerializer, ResetPasswordSerializer, VerifyResetOTPSerializer
from config.core.services.otp_service import verify_otp,send_otp
from config.core.services.password_service import send_reset_otp, verify_reset_otp
from config.core.redis_client import redis_client

# Create your views here.

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()

    serializer_class = RegisterSerializer

    def perform_create(self, serializer):
        user = serializer.save(is_verified=False)

        send_otp(user.email)


class LoginView(APIView):
    def post(self,request):
        self.permission_classes = [AllowAny]

        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        return Response(serializer.validated_data, status=status.HTTP_200_OK)
    
class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)

        return Response(serializer.data)
    
class logoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self,request):
        serializer = LogoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        return Response({"message":"logged out successfully"})
    
class verifyOTPView(APIView):
    def post(self,request):
        serializer = VerifyOTPSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        email = serializer.validated_data["email"]
        otp = serializer.validated_data["otp"]

        success, message = verify_otp(email,otp)

        if not success:
            return Response({"error":message},status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user=User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error":"User not found"},status=status.HTTP_404_NOT_FOUND)
        
        user.is_verified = True
        user.save()

        return Response({"message":"OTP verified successfully"},status=status.HTTP_200_OK)
    


class ResendOTPView(APIView):
    def post(self, request):
        serializer = ResendOTPSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        email = serializer.validated_data["email"]

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"errors": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        
        if user.is_verified:
            return Response({"errors":"The account is already verified"},status=status.HTTP_400_BAD_REQUEST)

        success,message = send_otp(email) 

        if not success:
            return Response(
                {"error":message},status=status.HTTP_400_BAD_REQUEST
            )
        


        return Response({"message": "OTP resend"}, status=status.HTTP_200_OK)
    
class ForgetPasswordView(APIView):
    def post(self,request):
        serializer = ForgotPasswordSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
        
        email=serializer.validated_data["email"]

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"message":"If account exists, OTP sent"}, status=status.HTTP_200_OK)
        
        send_reset_otp(email)

        return Response({"meassage":"if accounts exists, OTP sent"},status=status.HTTP_200_OK)
    

class VerifyResetOTPView(APIView):
    def post(self, request):
        serializer = VerifyResetOTPSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        email = serializer.validated_data["email"]
        otp = serializer.validated_data["otp"]

        success, message = verify_reset_otp(email, otp)

        if not success:
            return Response({"error": message}, status=400)

        return Response({"message": message}, status=200)
    
class ResetPasswordView(APIView):
    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        email = serializer.validated_data["email"]
        new_password = serializer.validated_data["new_password"]

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)
        
        verified_key = f"reset_verified:{email}"

        if not redis_client.get(verified_key):
            return Response({"error":"OTP verification required"}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()

        redis_client.delete(verified_key)

        return Response({"message": "Password reset successful"}, status=200)