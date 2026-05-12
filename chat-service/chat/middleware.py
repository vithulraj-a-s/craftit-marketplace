from channels.middleware import BaseMiddleware
from jwt import decode as jwt_decode
from jwt import ExpiredSignatureError, InvalidTokenError
from django.conf import settings
from http.cookies import SimpleCookie


# 🔥 Simple lightweight user (NO DB call)
class SimpleUser:
    def __init__(self, user_id, role):
        self.id = user_id
        self.role = role
        self.is_authenticated = True

    def __str__(self):
        return f"User(id={self.id}, role={self.role})"


class JWTAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):

        try:
            headers = dict(scope.get("headers", []))

            # 🔥 Extract cookies
            raw_cookie = headers.get(b"cookie", b"").decode()
            print("🍪 RAW COOKIE:", raw_cookie)

            cookie = SimpleCookie()
            cookie.load(raw_cookie)

            token = None

            # 🔥 IMPORTANT: match your actual cookie name
            if "access_token" in cookie:
                token = cookie["access_token"].value

            print("🔐 TOKEN:", token)

            if not token:
                print("❌ No token found")
                scope["user"] = None
                return await super().__call__(scope, receive, send)

            # 🔥 Decode JWT
            try:
                decoded = jwt_decode(
                    token,
                    settings.SECRET_KEY,
                    algorithms=["HS256"]
                )
                print("✅ DECODED:", decoded)

            except ExpiredSignatureError:
                print("❌ Token expired")
                scope["user"] = None
                return await super().__call__(scope, receive, send)

            except InvalidTokenError:
                print("❌ Invalid token")
                scope["user"] = None
                return await super().__call__(scope, receive, send)

            # 🔥 Extract user info
            user_id = decoded.get("user_id")
            role = decoded.get("role")

            if not user_id:
                print("❌ No user_id in token")
                scope["user"] = None
                return await super().__call__(scope, receive, send)

            try:
                user_id = int(user_id)
            except Exception:
                print("❌ user_id not valid")
                scope["user"] = None
                return await super().__call__(scope, receive, send)

            # 🔥 Assign user
            scope["user"] = SimpleUser(
                user_id=user_id,
                role=role or "client"
            )

            print("👤 USER SET:", scope["user"])

        except Exception as e:
            print("❌ Middleware Exception:", str(e))
            scope["user"] = None

        return await super().__call__(scope, receive, send)