export const PERMISSIONS = {
  MANAGE_STAFF: 'manage_staff',
  MANAGE_USERS: 'manage_users',
  MANAGE_ORDERS: 'manage_orders',
  MANAGE_REQUESTS: 'manage_requests',
  VIEW_ANALYTICS: 'view_analytics',
  PLATFORM_SETTINGS: 'platform_settings',
  BAN_USERS: 'ban_users',
};

export const hasPermission = (user, permission) => {
  if (!user || !user.is_staff || !user.staff_profile) return false;

  // SUPER_ADMIN implicitly has all permissions
  if (user.staff_profile.role === 'SUPER_ADMIN') return true;

  // Array of permissions returned by backend
  const userPermissions = user.staff_profile.permissions || [];
  
  return userPermissions.includes(permission);
};
