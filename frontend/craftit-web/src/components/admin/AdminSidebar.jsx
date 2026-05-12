import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, ShoppingCart, DollarSign, ClipboardList, X, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { hasPermission, PERMISSIONS } from '../../lib/permissions';

export default function AdminSidebar({ open, setOpen }) {
  const { user } = useAuth();
  
  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard, permission: null },
    { name: 'Analytics', path: '/admin/analytics', icon: DollarSign, permission: PERMISSIONS.VIEW_ANALYTICS },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingCart, permission: PERMISSIONS.MANAGE_ORDERS },
    { name: 'Requests', path: '/admin/requests', icon: ClipboardList, permission: PERMISSIONS.MANAGE_REQUESTS },
    { name: 'Users', path: '/admin/users', icon: Users, permission: PERMISSIONS.MANAGE_USERS },
    { name: 'Staff', path: '/admin/staff', icon: Shield, permission: PERMISSIONS.MANAGE_STAFF },
  ];

  const filteredNavItems = navItems.filter(item => 
    !item.permission || hasPermission(user, item.permission)
  );

  return (
    <aside 
      className={`fixed top-0 left-0 z-50 h-screen w-64 bg-[#212529] dark:bg-slate-900 shadow-xl transition-transform duration-300 ease-in-out ${
        open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      } flex flex-col border-r border-gray-800/50`}
    >
      <div className="h-20 flex items-center justify-between px-6 border-b border-gray-800/50">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
            C
          </div>
          <span className="text-lg font-bold text-white tracking-wide">CraftIt Admin</span>
        </div>
        <button onClick={() => setOpen(false)} className="lg:hidden text-gray-400 hover:text-white transition-colors">
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {filteredNavItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20 font-medium'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <item.icon size={20} className={location.pathname === item.path ? "text-white" : "text-gray-400"}/>
            <span className="text-sm">{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
