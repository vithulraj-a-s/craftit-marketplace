from channels.middleware import BaseMiddleware
from jwt import decode as jwt_decode
from jwt import ExpiredSignatureError, InvalidTokenError
from django.conf import settings


# ✅ Simple user object (NO DB)
class SimpleUser:
    def __init__(self, user_id, role):
        self.id = user_id
        self.role = role
        self.is_authenticated = True

    def __str__(self):
        return f"User(id={self.id}, role={self.role})"


class JWTAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        from django.contrib.auth.models import AnonymousUser

        try:
            headers = dict(scope.get("headers", []))
            raw_cookies = headers.get(b"cookie", b"").decode()

            print("🔥 COOKIES RAW:", raw_cookies, flush=True)

            # 🔹 Parse cookies
            cookie_dict = {}
            for item in raw_cookies.split(";"):
                if "=" in item:
                    key, value = item.strip().split("=", 1)
                    cookie_dict[key] = value

            token = cookie_dict.get("access_token")

            if not token:
                print("⚠️ NO ACCESS TOKEN", flush=True)
                scope["user"] = AnonymousUser()
                return await super().__call__(scope, receive, send)

            # 🔹 Decode JWT
            try:
                decoded = jwt_decode(
                    token,
                    settings.SECRET_KEY,
                    algorithms=["HS256"]
                )
                print("✅ TOKEN DECODED:", decoded, flush=True)

            except ExpiredSignatureError:
                print("🔥 JWT ERROR: Token expired", flush=True)
                scope["user"] = AnonymousUser()
                return await super().__call__(scope, receive, send)

            except InvalidTokenError as e:
                print(f"🔥 JWT ERROR: {str(e)}", flush=True)
                scope["user"] = AnonymousUser()
                return await super().__call__(scope, receive, send)

            # 🔹 Extract data
            user_id = decoded.get("user_id")
            role = decoded.get("role")

            if not user_id:
                print("🔥 JWT ERROR: user_id missing", flush=True)
                scope["user"] = AnonymousUser()
                return await super().__call__(scope, receive, send)

            try:
                user_id = int(user_id)
            except Exception:
                print(f"🔥 JWT ERROR: invalid user_id → {user_id}", flush=True)
                scope["user"] = AnonymousUser()
                return await super().__call__(scope, receive, send)

            # 🔥 FINAL USER ASSIGNMENT (NO DB)
            scope["user"] = SimpleUser(
                user_id=user_id,
                role=role or "client"
            )

            print(f"✅ AUTH USER: {scope['user']}", flush=True)

        except Exception as e:
            print(f"🔥 MIDDLEWARE CRASH: {str(e)}", flush=True)
            scope["user"] = AnonymousUser()

        return await super().__call__(scope, receive, send)