from config.core.redis_client import redis_client
from config.core.utils import generate_otp
from config.core.services.email_service import send_otp_mail


OTP_EXPIRY = 300
RESEND_COOLDOWN = 60  # seconds

MAX_OTP_ATTEMPTS = 5
ATTEMPT_EXPIRY = 300

# works with the lgin rate limiting 
MAX_LOGIN_ATTEMPTS = 5
LOGIN_ATTEMPT_EXPIRY = 300

def send_otp(email: str):
    
    key = f"otp:{email}"
    cooldown_key = f"otp_cooldown:{email}"
    attempts_key = f"otp_attempts:{email}"

    if redis_client.get(cooldown_key):
        return False, "Please wait before another otp. It will take few seconds"

    otp = generate_otp()

    redis_client.set(key, otp, ex=OTP_EXPIRY)

    redis_client.delete(attempts_key)

    redis_client.set(cooldown_key, "1", ex=RESEND_COOLDOWN)

    send_otp_mail(email,otp)

    return True, "OTP sent successfully"

def verify_otp(email: str, otp: str):
    if not otp:
        return False, "otp is required"
    
    key = f"otp:{email}"
    attempts_key = f"otp_attempts:{email}"

    stored_otp = redis_client.get(key)

    attempts = redis_client.get(attempts_key)

    if attempts and int(attempts) >= MAX_OTP_ATTEMPTS:
        return False, "Too many failed attempts. Try again later."

    if not stored_otp:
        return False, "otp expired or not found"
    
    if stored_otp != otp:
        redis_client.incr(attempts_key)

        if not attempts:
            redis_client.expire(attempts_key,ATTEMPT_EXPIRY)

        return False, "Invalid OTP"
    
    redis_client.delete(key)
    redis_client.delete(attempts_key)

    return True, "OTP verified"


    