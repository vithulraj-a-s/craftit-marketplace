from .constants import ROLE_PERMISSIONS


def get_staff_role(user):

    if not user.is_staff:
        return None

    staff_profile = getattr(user, "staff_profile", None)

    if not staff_profile:
        return None

    if not staff_profile.is_active_staff:
        return None

    return staff_profile.role


def get_user_permissions(user):

    role = get_staff_role(user)

    if not role:
        return set()

    return ROLE_PERMISSIONS.get(role, set())


def has_permission(user, permission):

    permissions = get_user_permissions(user)

    return permission in permissions