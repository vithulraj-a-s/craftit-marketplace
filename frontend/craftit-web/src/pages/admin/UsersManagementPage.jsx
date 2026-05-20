import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import axiosInstance from '../../services/axiosInstance';
import KPICard from '../../components/admin/KPICard';
import UsersTable from '../../components/admin/users/UsersTable';
import { Loader } from '../../components/ui/Loader';

export default function UsersManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [verifiedFilter, setVerifiedFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');

  const [stats, setStats] = useState({
    total: 0,
    artists: 0,
    verified: 0,
    active: 0
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (roleFilter) params.append('role', roleFilter);
      if (verifiedFilter) params.append('verified', verifiedFilter);
      if (activeFilter) params.append('active', activeFilter);

      const response = await axiosInstance.get(`/api/dashboard/users/?${params.toString()}`);
      setUsers(response.data);

      const data = response.data;
      setStats({
        total: data.length,
        artists: data.filter(u => u.role === 'ARTIST').length,
        verified: data.filter(u => u.is_verified).length,
        active: data.filter(u => u.is_active).length,
      });

    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(delay);
  }, [searchQuery, roleFilter, verifiedFilter, activeFilter]);

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Users Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Monitor, verify, and moderate platform members</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 gap-y-12 lg:gap-y-6 mt-4">
        <KPICard 
          title="Total Users" 
          value={stats.total} 
          cardBgClass="bg-gradient-to-br from-slate-700 to-slate-800" 
          delay={0}
        />
        <KPICard 
          title="Total Artists" 
          value={stats.artists} 
          cardBgClass="bg-gradient-to-br from-purple-500 to-purple-600" 
          delay={0.1}
        />
        <KPICard 
          title="Verified Accounts" 
          value={stats.verified} 
          cardBgClass="bg-gradient-to-br from-emerald-500 to-emerald-600" 
          delay={0.2}
        />
        <KPICard 
          title="Active Sessions" 
          value={stats.active} 
          cardBgClass="bg-gradient-to-br from-blue-500 to-blue-600" 
          delay={0.3}
        />
      </div>

      {/* Filters Area */}
      <div className="flex flex-col md:flex-row gap-4 mt-8 bg-white dark:bg-[#1E293B] p-4 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search by email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all appearance-none sm:w-40"
          >
            <option value="">All Roles</option>
            <option value="ARTIST">Artist</option>
            <option value="CLIENT">Client</option>
          </select>
          <select
            value={verifiedFilter}
            onChange={(e) => setVerifiedFilter(e.target.value)}
            className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all appearance-none sm:w-40"
          >
            <option value="">All Verification</option>
            <option value="true">Verified</option>
            <option value="false">Unverified</option>
          </select>
          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all appearance-none sm:w-40"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-12 shadow-sm border border-gray-100 dark:border-slate-800 flex justify-center mt-6">
          <Loader size={32} />
        </div>
      ) : (
        <UsersTable users={users} />
      )}

    </div>
  );
}
