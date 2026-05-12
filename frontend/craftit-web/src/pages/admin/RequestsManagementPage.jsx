import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import axiosInstance from '../../services/axiosInstance';
import KPICard from '../../components/admin/KPICard';
import RequestsTable from '../../components/admin/requests/RequestsTable';
import { Loader } from '../../components/ui/Loader';

export default function RequestsManagementPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [styleFilter, setStyleFilter] = useState('');

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    quote_sent: 0,
    cancelled: 0
  });

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (statusFilter) params.append('status', statusFilter);
      if (styleFilter) params.append('style', styleFilter);

      const response = await axiosInstance.get(`/dashboard/requests/?${params.toString()}`);
      setRequests(response.data);

      const data = response.data;
      setStats({
        total: data.length,
        pending: data.filter(r => r.status === 'pending').length,
        quote_sent: data.filter(r => r.status === 'quote_sent').length,
        cancelled: data.filter(r => r.status === 'cancelled').length,
      });

    } catch (error) {
      console.error('Failed to fetch requests', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchRequests();
    }, 300);
    return () => clearTimeout(delay);
  }, [searchQuery, statusFilter, styleFilter]);

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Requests Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Inspect marketplace portrait requests and track workflow stages</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 gap-y-12 lg:gap-y-6 mt-4">
        <KPICard 
          title="Total Requests" 
          value={stats.total} 
          cardBgClass="bg-gradient-to-br from-slate-700 to-slate-800" 
          delay={0}
        />
        <KPICard 
          title="Pending Response" 
          value={stats.pending} 
          cardBgClass="bg-gradient-to-br from-amber-500 to-amber-600" 
          delay={0.1}
        />
        <KPICard 
          title="Quote Sent" 
          value={stats.quote_sent} 
          cardBgClass="bg-gradient-to-br from-blue-500 to-blue-600" 
          delay={0.2}
        />
        <KPICard 
          title="Cancelled" 
          value={stats.cancelled} 
          cardBgClass="bg-gradient-to-br from-slate-500 to-slate-600 dark:from-slate-600 dark:to-slate-700" 
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
            placeholder="Search by title or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <select
            value={styleFilter}
            onChange={(e) => setStyleFilter(e.target.value)}
            className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all appearance-none sm:w-48"
          >
            <option value="">All Styles</option>
            <option value="pencil">Pencil</option>
            <option value="watercolor">Watercolor</option>
            <option value="oil">Oil</option>
            <option value="digital">Digital</option>
            <option value="charcoal">Charcoal</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all appearance-none sm:w-48"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="quote_sent">Quote Sent</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-12 shadow-sm border border-gray-100 dark:border-slate-800 flex justify-center mt-6">
          <Loader size={32} />
        </div>
      ) : (
        <RequestsTable requests={requests} />
      )}

    </div>
  );
}
