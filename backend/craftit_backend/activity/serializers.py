from rest_framework import serializers


class ClientNavbarSummarySerializer(serializers.Serializer):

    quotes_pending = serializers.IntegerField()

    has_active_orders = serializers.BooleanField()

class ArtistNavbarSummarySerializer(serializers.Serializer):

    requests_pending = serializers.IntegerField()

    has_active_orders = serializers.BooleanField()