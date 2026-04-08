from django.contrib import admin
from .models import SavedArtist

# Register your models here.

@admin.register(SavedArtist)
class SavedArtistAdmin(admin.ModelAdmin):
    list_display = [
        "id",
        "client_profile",
        "artist_profile",
        "created_at",
    ]
    search_fields = [
        "client_profile__full_name",
        "artist_profile__display_name",
    ]
    list_filter = ["created_at"]