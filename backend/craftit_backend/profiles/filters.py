import django_filters

from profiles.models import ArtistProfile


class ArtistProfileFilter(django_filters.FilterSet):
    min_price = django_filters.NumberFilter(
        field_name="base_price",
        lookup_expr="gte",
    )

    max_price = django_filters.NumberFilter(
        field_name="base_price",
        lookup_expr="lte",
    )

    max_delivery_days = django_filters.NumberFilter(
        field_name="max_delivery_days",
        lookup_expr="lte",
    )

    is_available = django_filters.BooleanFilter(
        field_name="is_available_for_commission",
    )

    portrait_style = django_filters.CharFilter(
        method="filter_portrait_style"
    )

    class Meta:
        model = ArtistProfile
        fields = []

    def filter_portrait_style(self, queryset, name, value):
        return queryset.filter(
            portrait_styles__contains=[value.lower()]
        )