from config.core.redis_client import redis_client
from config.core.utils import generate_otp
from config.core.services.email_service import send_otp_mail


RESET_OTP_EXPIRY = 300
RESET_COOLDOWN = 60

def send_reset_otp(email:str):
    otp_key = f"reset_otp:{email}"
    cooldown_key = f"reset_cooldown:{email}"
    attempts_key = f"reset_attempts:{email}"
    # verified_key = f"reset_verified:{email}"

    if redis_client.get(cooldown_key):
        return False, {"detail":"Please wait for few seconds to send again","code":"cooldown for resending"}
    
    otp = generate_otp()

    redis_client.set(otp_key, otp, ex=RESET_OTP_EXPIRY)
    redis_client.set(cooldown_key,"1", ex=RESET_COOLDOWN)
    # redis_client.set(verified_key, "1", ex=RESET_OTP_EXPIRY)

    redis_client.delete(attempts_key)

    send_otp_mail(email,otp)

    return True, {"detail":"Sent reset OTP successfully", "code":"Reset otp sent"}


MAX_RESET_ATTEMPTS = 5

def verify_reset_otp(email: str, otp: str):
    if not otp:
        return False, {"detail":"OTP is required","code":"otp is required"}
    
    otp_key = f"reset_otp:{email}"
    attempts_key = f"reset_attempts:{email}"
    verified_key = f"reset_verified:{email}"

    

    attempts = redis_client.get(attempts_key)

    if attempts and int(attempts) >= MAX_RESET_ATTEMPTS:
        return False, {"detail":"Too many attempts. Try again later", "code":"attempts limit exceeded"}
    
    stored_otp = redis_client.get(otp_key)

    if not stored_otp:
        return False, {"detail":"OTP expired or not found", "code":"otp not found"}
    
    if stored_otp != otp:
        new_attempts = redis_client.incr(attempts_key)

        if new_attempts == 1:
            redis_client.expire(attempts_key, RESET_OTP_EXPIRY)

        return False, {"detail":"Invalid OTP","code":"invalid otp"}
    
    redis_client.delete(otp_key)
    redis_client.delete(attempts_key)
    
    redis_client.set(verified_key, "1", ex=RESET_OTP_EXPIRY)


    return True,{"detail":"OTP verified","code":"otp verified"}


    