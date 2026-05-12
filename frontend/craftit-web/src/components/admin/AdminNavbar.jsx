import React from 'react';
import { Menu, Moon, Sun, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

export default function AdminNavbar({ onMenuClick }) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400';
      case 'SUPPORT': return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400';
      case 'ANALYST': return 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-400';
    }
  };

  const getInitials = (user) => {
    if (user?.staff_profile?.full_name) {
      return user.staff_profile.full_name.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'A';
  };

  return (
    <header className="h-20 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 bg-[#F8F9FA]/80 dark:bg-[#0F172A]/80 backdrop-blur-md">
      <div className="flex items-center">
        <button 
          onClick={onMenuClick} 
          className="mr-4 lg:hidden text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <Menu size={24} />
        </button>
        <div className="hidden sm:flex flex-col">
          <span className="text-xs text-slate-400 dark:text-slate-500 mb-0.5">Pages / Dashboard</span>
          <span className="text-base font-bold text-slate-800 dark:text-white">Dashboard</span>
        </div>
      </div>

      <div className="flex items-center space-x-4 sm:space-x-6">
        <button 
          onClick={toggleTheme} 
          className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {user && (
          <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-slate-700/50">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-semibold text-slate-800 dark:text-white tracking-wide">
                {user.email}
              </span>
              <span className={`mt-0.5 text-[10px] px-2 py-0.5 rounded-full font-medium tracking-wider uppercase border border-white/5 ${getRoleBadgeColor(user.staff_profile?.role)}`}>
                {user.staff_profile?.role?.replace('_', ' ') || 'STAFF'}
              </span>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800 flex items-center justify-center text-white font-bold text-sm shadow-md hover:shadow-lg hover:opacity-90 transition-all border-2 border-white dark:border-slate-800 cursor-pointer">
              {getInitials(user)}
            </div>
            
            <button 
              onClick={handleLogout}
              className="ml-1 p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
