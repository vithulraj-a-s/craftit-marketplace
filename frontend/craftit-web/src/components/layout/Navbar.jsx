import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, LayoutDashboard, User, Users, Palette, Bookmark, Inbox, Package, FileText } from 'lucide-react';

export default function Navbar() {
  const { user, logout, unreadMap, fetchUnreadCounts } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.id) {
      fetchUnreadCounts();
    }
  }, [user?.id]);

  const totalUnread = Object.values(unreadMap).reduce((a, b) => a + b, 0);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isArtist = user?.role === 'ARTIST' || user?.role === 'artist';
  const isClient = user?.role === 'CLIENT' || user?.role === 'client';

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to={user ? (isArtist ? '/dashboard/artist' : '/artists') : '/'} className="flex shrink-0 items-center gap-2">
              <Palette className="h-8 w-8 text-indigo-600" />
              <span className="font-extrabold text-xl tracking-tight text-gray-900">Craftit</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4 sm:space-x-8">
            {user && (
              <div className="hidden sm:flex sm:items-center sm:space-x-8">
                {isArtist && (
                  <>
                    <Link to="/dashboard/artist" className="text-gray-500 hover:text-indigo-600 px-3 py-2 text-sm font-semibold flex items-center gap-2">
                      <LayoutDashboard size={16} /> Dashboard
                    </Link>
                    <Link to="/dashboard/artist/requests" className="text-gray-500 hover:text-indigo-600 px-3 py-2 text-sm font-semibold flex items-center gap-2">
                      <Inbox size={16} /> Requests
                    </Link>
                    <Link to="/dashboard/artist/quotes" className="text-gray-500 hover:text-indigo-600 px-3 py-2 text-sm font-semibold flex items-center gap-2">
                      <FileText size={16} /> Quotes
                    </Link>
                    <Link to="/dashboard/artist/orders" className="relative text-gray-500 hover:text-indigo-600 px-3 py-2 text-sm font-semibold flex items-center gap-2">
                      <Package size={16} /> Orders
                      {totalUnread > 0 && (
                        <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full ml-1">
                          {totalUnread}
                        </span>
                      )}
                    </Link>
                    <Link to="/dashboard/artist/profile" className="text-gray-500 hover:text-indigo-600 px-3 py-2 text-sm font-semibold flex items-center gap-2">
                      <User size={16} /> My Profile
                    </Link>
                  </>
                )}
                
                {isClient && (
                  <>
                    <Link to="/artists" className="text-gray-500 hover:text-indigo-600 px-3 py-2 text-sm font-semibold flex items-center gap-2">
                      <Users size={16} /> Browse Artists
                    </Link>
                    <Link to="/dashboard/client/saved-artists" className="text-gray-500 hover:text-indigo-600 px-3 py-2 text-sm font-semibold flex items-center gap-2">
                      <Bookmark size={16} /> Saved Artists
                    </Link>
                    <Link to="/dashboard/client/requests" className="text-gray-500 hover:text-indigo-600 px-3 py-2 text-sm font-semibold flex items-center gap-2">
                      <Inbox size={16} /> My Requests
                    </Link>
                    <Link to="/dashboard/client/quotes" className="text-gray-500 hover:text-indigo-600 px-3 py-2 text-sm font-semibold flex items-center gap-2">
                      <FileText size={16} /> My Quotes
                    </Link>
                    <Link to="/dashboard/client/orders" className="relative text-gray-500 hover:text-indigo-600 px-3 py-2 text-sm font-semibold flex items-center gap-2">
                      <Package size={16} /> My Orders
                      {totalUnread > 0 && (
                        <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full ml-1">
                          {totalUnread}
                        </span>
                      )}
                    </Link>
                    <Link to="/dashboard/client/profile" className="text-gray-500 hover:text-indigo-600 px-3 py-2 text-sm font-semibold flex items-center gap-2">
                      <User size={16} /> My Profile
                    </Link>
                  </>
                )}
              </div>
            )}

            <div className="flex items-center pl-4 border-l border-gray-200">
              {user ? (
                <button
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-red-600 p-2 rounded-full transition-colors hidden sm:flex items-center gap-2 text-sm font-semibold"
                >
                  <LogOut size={16} /> Logout
                </button>
              ) : (
                <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-bold text-sm">
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
