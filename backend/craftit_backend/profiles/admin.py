from django.contrib import admin
from .models import ArtistProfile,ClientProfile

# Register your models here.



@admin.register(ArtistProfile)
class ArtistProfileAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "display_name",
        "user",
        "is_available_for_commission",
        "base_price",
        "created_at",
    )
    search_fields = ("display_name", "user__email", "slug")
    list_filter = ("is_available_for_commission",)


@admin.register(ClientProfile)
class ClientProfileAdmin(admin.ModelAdmin):
    list_display = ("id", "full_name", "user", "created_at")
    search_fields = ("full_name", "user__email")


