from django.apps import AppConfig


class AIConfig(AppConfig):

    default_auto_field = "django.db.models.BigAutoField"

    name = "ai"

    def ready(self):

        import ai.signals.artist_indexing_signals