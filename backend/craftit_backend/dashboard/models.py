from django.db import models
from users.models import User

# Create your models here.
class StaffProfile(models.Model):

    ROLE_CHOICES = (
        ("SUPER_ADMIN", "SUPER_ADMIN"),
        ("SUPPORT", "SUPPORT"),
        ("ANALYST", "ANALYST"),
    )

    user = models.OneToOneField(User,on_delete=models.CASCADE, related_name="staff_profile")

    full_name = models.CharField(max_length=120, blank=True, null=True)

    role = models.CharField(max_length=30, choices=ROLE_CHOICES)

    job_title = models.CharField(max_length=100)

    phone_number = models.CharField(max_length=20)

    department = models.CharField(max_length=100, blank=True, null=True)

    permissions = models.JSONField(default=list, blank=True)

    is_active_staff = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)