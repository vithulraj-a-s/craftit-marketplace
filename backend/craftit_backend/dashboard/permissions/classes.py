from rest_framework.permissions import BasePermission

from .utils import has_permission
from .constants import DashboardPermissions


class IsDashboardStaff(BasePermission):

    def has_permission(self, request, view):

        return (
            request.user and
            request.user.is_authenticated and
            request.user.is_staff
        )
    
class HasDashboardPermission(BasePermission):
    required_permission = None

    def has_permission(self, request, view):

        if not (
            request.user and
            request.user.is_authenticated and
            request.user.is_staff
        ):
            return False

        return has_permission(
            request.user,
            self.required_permission
        )
    
class CanManageStaff(HasDashboardPermission):
    required_permission = (
        DashboardPermissions.MANAGE_STAFF
    )

class CanManageUsers(HasDashboardPermission):
    required_permission = (
        DashboardPermissions.MANAGE_USERS
    )

class CanManageOrders(HasDashboardPermission):
    required_permission = (
        DashboardPermissions.MANAGE_ORDERS
    )

class CanManageRequests(HasDashboardPermission):
    required_permission = (
        DashboardPermissions.MANAGE_REQUESTS
    )

class CanViewAnalytics(HasDashboardPermission):
    required_permission = (
        DashboardPermissions.VIEW_ANALYTICS
    )

class CanManagePlatformSettings(HasDashboardPermission):
    required_permission = (
        DashboardPermissions.PLATFORM_SETTINGS
    )