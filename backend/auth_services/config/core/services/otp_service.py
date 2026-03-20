from config.core.redis_client import redis_client
from config.core.utils import generate_otp
from config.core.services.email_service import send_otp_mail


OTP_EXPIRY = 300
RESEND_COOLDOWN = 60  # seconds

def send_otp(email: str):
    
    key = f"otp:{email}"
    cooldown_key = f"otp_cooldown:{email}"

    if redis_client.get(cooldown_key):
        return False, "Please wait before another otp. It will take few seconds"

    otp = generate_otp()

    redis_client.set(key, otp, ex=OTP_EXPIRY)

    redis_client.set(cooldown_key, "1", ex=RESEND_COOLDOWN)

    send_otp_mail(email,otp)

    return True, "OTP sent successfully"

def verify_otp(email: str, otp: str):
    if not otp:
        return False, "otp is required"
    
    key = f"otp:{email}"

    stored_otp = redis_client.get(key)

    if not stored_otp:
        return False, "otp expired or not found"
    if stored_otp != otp:
        return False, "Invalid OTP"
    
    redis_client.delete(key)

    return True, "OTP verified"


    