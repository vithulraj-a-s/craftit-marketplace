from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path("register/",views.RegisterView.as_view(), name="register"),
    path("login/",views.LoginView.as_view(), name="login"),
    path("token/refresh/",TokenRefreshView.as_view(), name="token_refresh"),
    path("me/",views.MeView.as_view(), name= "me"),
    path("logout/",views.logoutView.as_view(), name= "logout"),
    path("verify-otp/",views.verifyOTPView.as_view(), name="verify-otp"),
    path("resend-otp/",views.ResendOTPView.as_view(), name="resend-otp"),
    path("forgot-password/", views.ForgetPasswordView.as_view(), name="forgot-password"),
    path("verify-reset-otp/", views.VerifyResetOTPView.as_view(), name="verify-reset-otp"),
    path("reset-password/", views.ResetPasswordView.as_view(), name="reset-password"),
]