import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { User, Image as ImageIcon, MessageSquare, Tag, ShoppingBag } from 'lucide-react';

export default function ArtistDashboard() {
  const { user } = useAuth();
  const displayName = user?.email ? user.email.split('@')[0] : 'Artist';

  const menuItems = [
    { name: 'Edit Profile', path: '/dashboard/artist/profile', icon: <User size={24} />, active: true },
    { name: 'Manage Portfolio', path: '/dashboard/artist/portfolio', icon: <ImageIcon size={24} />, active: true },
    { name: 'Incoming Requests', path: '/dashboard/artist/requests', icon: <MessageSquare size={24} />, active: true },
    { name: 'Quotes', path: '/dashboard/artist/quotes', icon: <Tag size={24} />, active: true },
    { name: 'Orders', path: '/dashboard/artist/orders', icon: <ShoppingBag size={24} />, active: true },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-8">
        Welcome back, {displayName}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`group relative flex flex-col p-6 rounded-2xl border transition-all ${
              item.active 
                ? 'bg-white border-indigo-100 shadow-sm hover:shadow-md hover:border-indigo-300' 
                : 'bg-gray-50 border-gray-200 opacity-75 hover:opacity-100 hover:shadow-sm'
            }`}
          >
            <div className={`mb-4 inline-flex p-3 rounded-xl ${item.active ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-100 text-gray-500'}`}>
              {item.icon}
            </div>
            <h3 className={`text-lg font-bold mb-1 ${item.active ? 'text-gray-900 group-hover:text-indigo-600 transition-colors' : 'text-gray-700'}`}>
              {item.name}
            </h3>
            {/* {!item.active && (
              // <span className="mt-2 inline-flex absolute top-6 right-6 items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              //   Coming Soon available on hotstar 
              // </span>
            )} */}
          </Link>
        ))}
      </div>
    </div>
  );
}
