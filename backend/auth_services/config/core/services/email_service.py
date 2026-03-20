from django.core.mail import send_mail
from django.conf import settings

def send_otp_mail(email:str, otp:str):
    subject = "Verify your email"
    message = f"Your OTP is {otp}\n THis will expire in 5 minutes..."

    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [email],
        fail_silently=False # false because we need to see errors
    )