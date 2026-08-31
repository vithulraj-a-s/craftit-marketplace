from config.core.redis_client import redis_client
from config.core.utils import generate_otp
from config.core.services.email_service import send_otp_mail


OTP_EXPIRY = 300
RESEND_COOLDOWN = 30  # seconds

MAX_OTP_ATTEMPTS = 5
ATTEMPT_EXPIRY = 300

# works with the login rate limiting 
MAX_LOGIN_ATTEMPTS = 5
LOGIN_ATTEMPT_EXPIRY = 300

def send_otp(email: str):
    
    key = f"otp:{email}"
    cooldown_key = f"otp_cooldown:{email}"
    attempts_key = f"otp_attempts:{email}"

    if redis_client.get(cooldown_key):
        return False, {"detail":"Please wait before another otp. It will take few seconds","code":"otp cooldown time"}

    otp = generate_otp()

    redis_client.set(key, otp, ex=OTP_EXPIRY)

    redis_client.delete(attempts_key)

    redis_client.set(cooldown_key, "1", ex=RESEND_COOLDOWN)

    try:
        send_otp_mail(email, otp)
    except Exception as e:
        redis_client.delete(key)
        redis_client.delete(cooldown_key)
        from rest_framework.exceptions import ValidationError
        raise ValidationError({
            "detail": "Failed to send verification email. Please check SMTP settings or network connection.",
            "code": "email_send_failed"
        })

    return True, {"detail":"OTP sent successfully", "code":"otp sent"}

def verify_otp(email: str, otp: str):
    if not otp:
        return False, {"detail": "OTP is required", "code": "otp_required"}
    
    key = f"otp:{email}"
    attempts_key = f"otp_attempts:{email}"

    stored_otp = redis_client.get(key)

    attempts = redis_client.get(attempts_key)

    if attempts and int(attempts) >= MAX_OTP_ATTEMPTS:
        return False, {
            "detail": "Too many failed attempts. Try again later.",
            "code": "too_many_attempts"
        }

    if not stored_otp:
        return False, {
            "detail": "OTP expired or not found",
            "code": "otp_expired"
        }
    
    if stored_otp != otp:
        redis_client.incr(attempts_key)

        if not attempts:
            redis_client.expire(attempts_key,ATTEMPT_EXPIRY)

        return False, {
            "detail": "Invalid OTP",
            "code": "invalid_otp"
        }
    
    redis_client.delete(key)
    redis_client.delete(attempts_key)

    return True, {
        "detail": "OTP verified",
        "code": "success"
    }


    