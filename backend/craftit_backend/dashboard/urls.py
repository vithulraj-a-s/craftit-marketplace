from django.urls import path
from .views import (DashboardStatsAPIView,
                    DashboardChartsAPIView,
                    DashboardActivityAPIView,
                    StaffCreateView,
                    StaffUpdateView,
                    StaffToggleView,
                    StaffListView,
                    UserListView,
                    UserUpdateView,
                    OrderListView,
                    OrderUpdateView,
                    RequestListView)

urlpatterns = [
    # urls related to activity/analytics
    path("stats/",DashboardStatsAPIView.as_view(),name="dashboard-stats"),
    path("charts/",DashboardChartsAPIView.as_view(),name="dashboard-charts"),
    path("activity/",DashboardActivityAPIView.as_view(),name="dashboard-activity"),

    # urls realted to staff management
    path("staff/", StaffCreateView.as_view(), name="staff-create"),
    path("staff/<int:user_id>/",StaffUpdateView.as_view(),name="staff-update"),
    path("staff/<int:user_id>/toggle/",StaffToggleView.as_view(),name="staff-toggle"),
    path("staff/list/",StaffListView.as_view(),name="staff-list"),

    # urls related to user management
    path("users/",UserListView.as_view(),name="dashboard-users"),
    path("users/<int:user_id>/",UserUpdateView.as_view(),name="dashboard-user-update"),

    # urls related to orders management
    path("orders/",OrderListView.as_view(),name="dashboard-orders"),
    path("orders/<int:order_id>/",OrderUpdateView.as_view(),name="dashboard-order-update"),

    # urls related to portrait requests management
    path("requests/",RequestListView.as_view(),name="dashboard-requests"),
]