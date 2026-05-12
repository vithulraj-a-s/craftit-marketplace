from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from dashboard.permissions import (
    CanViewAnalytics
)
from django.db.models import Sum, Count
from django.db.models.functions import TruncWeek

from users.models import User
from orders.models import Order
from payments.models import Payment
from quotes.models import Quote
from portrait_requests.models import PortraitRequest


class DashboardStatsAPIView(APIView):
    permission_classes = [
        IsAuthenticated,
        CanViewAnalytics
    ]

    def get(self, request):

        total_users = User.objects.count()

        total_artists = User.objects.filter(role="ARTIST").count()

        total_clients = User.objects.filter(role="CLIENT").count()

        verified_users = User.objects.filter(is_verified=True).count()

        total_orders = Order.objects.count()

        pending_payment_orders = Order.objects.filter(status=Order.Status.PENDING_PAYMENT).count()

        in_progress_orders = Order.objects.filter(status=Order.Status.IN_PROGRESS).count()

        completed_orders = Order.objects.filter(status=Order.Status.COMPLETED).count()

        cancelled_orders = Order.objects.filter(status=Order.Status.CANCELLED).count()

        total_quotes = Quote.objects.count()

        accepted_quotes = Quote.objects.filter(status=Quote.Status.ACCEPTED).count()

        rejected_quotes = Quote.objects.filter(status=Quote.Status.REJECTED).count()

        pending_quotes = Quote.objects.filter(status=Quote.Status.PENDING).count()

        total_requests = PortraitRequest.objects.count()

        pending_requests = (
            PortraitRequest.objects.filter(
                status=PortraitRequest.Status.PENDING
            ).count()
        )

        quote_sent_requests = (
            PortraitRequest.objects.filter(
                status=PortraitRequest.Status.QUOTE_SENT
            ).count()
        )

        successful_payments = Payment.objects.filter(status=Payment.Status.SUCCESS)

        failed_payments = Payment.objects.filter(status=Payment.Status.FAILED).count()

        total_revenue = (
            successful_payments.aggregate(
                total=Sum("amount")
            )["total"] or 0
        )

        return Response({

            "users": {
                "total_users": total_users,
                "total_artists": total_artists,
                "total_clients": total_clients,
                "verified_users": verified_users,
            },

            "orders": {
                "total_orders": total_orders,
                "pending_payment": pending_payment_orders,
                "in_progress": in_progress_orders,
                "completed": completed_orders,
                "cancelled": cancelled_orders,
            },

            "quotes": {
                "total_quotes": total_quotes,
                "accepted_quotes": accepted_quotes,
                "rejected_quotes": rejected_quotes,
                "pending_quotes": pending_quotes,
            },

            "requests": {
                "total_requests": total_requests,
                "pending_requests": pending_requests,
                "quote_sent_requests": quote_sent_requests,
            },

            "payments": {
                "total_revenue": total_revenue,
                "successful_payments":
                    successful_payments.count(),
                "failed_payments":
                    failed_payments,
            }
        })


class DashboardChartsAPIView(APIView):

    permission_classes = [
        IsAuthenticated,
        CanViewAnalytics
    ]

    def get(self, request):

        revenue_data = (
            Payment.objects.filter(
                status=Payment.Status.SUCCESS
            )
            .annotate(
                week=TruncWeek("created_at")
            )
            .values("week")
            .annotate(
                revenue=Sum("amount")
            )
            .order_by("week")
        )


        users_data = (
            User.objects
            .annotate(
                week=TruncWeek("created_at")
            )
            .values("week")
            .annotate(
                users=Count("id")
            )
            .order_by("week")
        )

        orders_data = (
            Order.objects
            .annotate(
                week=TruncWeek("created_at")
            )
            .values("week")
            .annotate(
                orders=Count("id")
            )
            .order_by("week")
        )

        weekly_revenue = [
            {
                "week":
                    item["week"].strftime("%d %b"),

                "revenue":
                    float(item["revenue"] or 0)
            }
            for item in revenue_data
        ]

        weekly_users = [
            {
                "week":
                    item["week"].strftime("%d %b"),

                "users":
                    item["users"]
            }
            for item in users_data
        ]

        weekly_orders = [
            {
                "week":
                    item["week"].strftime("%d %b"),

                "orders":
                    item["orders"]
            }
            for item in orders_data
        ]

        return Response({

            "weekly_revenue":
                weekly_revenue,

            "weekly_users":
                weekly_users,

            "weekly_orders":
                weekly_orders
        })
    
class DashboardActivityAPIView(APIView):

    permission_classes = [
        IsAuthenticated,
        CanViewAnalytics
    ]

    def get(self, request):

        recent_users = (
            User.objects
            .order_by("-created_at")[:5]
        )

        users_data = [
            {
                "id": user.id,

                "email": user.email,

                "role": user.role,

                "is_verified":
                    user.is_verified,

                "created_at":
                    user.created_at.strftime(
                        "%d %b %Y"
                    )
            }
            for user in recent_users
        ]

        recent_orders = (
            Order.objects
            .select_related(
                "client_profile",
                "artist_profile"
            )
            .order_by("-created_at")[:5]
        )

        orders_data = [
            {
                "id": order.id,

                "status": order.status,

                "client":
                    order.client_profile.user.email,

                "artist":
                    order.artist_profile.user.email,

                "created_at":
                    order.created_at.strftime(
                        "%d %b %Y"
                    )
            }
            for order in recent_orders
        ]

        recent_payments = (
            Payment.objects
            .select_related("order")
            .order_by("-created_at")[:5]
        )

        payments_data = [
            {
                "id": payment.id,

                "amount":
                    float(payment.amount),

                "status":
                    payment.status,

                "created_at":
                    payment.created_at.strftime(
                        "%d %b %Y"
                    )
            }
            for payment in recent_payments
        ]

        recent_requests = (
            PortraitRequest.objects
            .order_by("-id")[:5]
        )

        requests_data = [
            {
                "id": req.id,

                "title":
                    req.title,

                "portrait_style":
                    req.portrait_style,

                "status":
                    req.status
            }
            for req in recent_requests
        ]

        return Response({

            "recent_users":
                users_data,

            "recent_orders":
                orders_data,

            "recent_payments":
                payments_data,

            "recent_requests":
                requests_data
        })