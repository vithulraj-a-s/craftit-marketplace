from quotes.models import Quote
from orders.models import Order
from portrait_requests.models import PortraitRequest


def get_client_navbar_summary(*, user):

    client_profile = user.client_profile

    quotes_pending = Quote.objects.filter(
            portrait_request__client_profile=client_profile,
            status=Quote.Status.PENDING,
        ).count()

    has_active_orders = Order.objects.filter(
        client_profile=client_profile,
        status=Order.Status.IN_PROGRESS
    ).exists()

    return {
        "quotes_pending": quotes_pending,
        "has_active_orders": has_active_orders,
    }

def get_artist_navbar_summary(*, user):

    artist_profile = user.artist_profile

    requests_pending = PortraitRequest.objects.filter(
        artist_profile=artist_profile,
        status=PortraitRequest.Status.PENDING
    ).count()

    has_active_orders = Order.objects.filter(
        artist_profile=artist_profile,
        status=Order.Status.IN_PROGRESS
    ).exists()

    return {
        "requests_pending": requests_pending,
        "has_active_orders": has_active_orders,
    }