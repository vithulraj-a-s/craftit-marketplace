class DashboardPermissions:

    MANAGE_STAFF = "manage_staff"

    MANAGE_USERS = "manage_users"

    MANAGE_ORDERS = "manage_orders"

    MANAGE_REQUESTS = "manage_requests"

    VIEW_ANALYTICS = "view_analytics"

    PLATFORM_SETTINGS = "platform_settings"

    BAN_USERS = "ban_users"

ROLE_PERMISSIONS = {

    "SUPER_ADMIN": {
        DashboardPermissions.MANAGE_STAFF,
        DashboardPermissions.MANAGE_USERS,
        DashboardPermissions.MANAGE_ORDERS,
        DashboardPermissions.MANAGE_REQUESTS,
        DashboardPermissions.VIEW_ANALYTICS,
        DashboardPermissions.PLATFORM_SETTINGS,
        DashboardPermissions.BAN_USERS,
    },

    "SUPPORT": {
        DashboardPermissions.MANAGE_USERS,
        DashboardPermissions.MANAGE_ORDERS,
        DashboardPermissions.MANAGE_REQUESTS,
    },

    "ANALYST": {
        DashboardPermissions.VIEW_ANALYTICS,
    },
}