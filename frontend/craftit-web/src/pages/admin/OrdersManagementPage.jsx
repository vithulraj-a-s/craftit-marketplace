import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import axiosInstance from '../../services/axiosInstance';
import KPICard from '../../components/admin/KPICard';
import OrdersTable from '../../components/admin/orders/OrdersTable';
import { Loader } from '../../components/ui/Loader';

export default function OrdersManagementPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [stats, setStats] = useState({
    total: 0,
    in_progress: 0,
    delivered: 0,
    completed: 0
  });

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (statusFilter) params.append('status', statusFilter);

      const response = await axiosInstance.get(`/dashboard/orders/?${params.toString()}`);
      setOrders(response.data);

      const data = response.data;
      setStats({
        total: data.length,
        in_progress: data.filter(o => o.status === 'in_progress').length,
        delivered: data.filter(o => o.status === 'delivered').length,
        completed: data.filter(o => o.status === 'completed').length,
      });

    } catch (error) {
      console.error('Failed to fetch orders', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchOrders();
    }, 300);
    return () => clearTimeout(delay);
  }, [searchQuery, statusFilter]);

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Orders Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Oversee marketplace commissions and operational workflows</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 gap-y-12 lg:gap-y-6 mt-4">
        <KPICard 
          title="Total Orders" 
          value={stats.total} 
          cardBgClass="bg-gradient-to-br from-slate-700 to-slate-800" 
          delay={0}
        />
        <KPICard 
          title="In Progress" 
          value={stats.in_progress} 
          cardBgClass="bg-gradient-to-br from-blue-500 to-blue-600" 
          delay={0.1}
        />
        <KPICard 
          title="Delivered" 
          value={stats.delivered} 
          cardBgClass="bg-gradient-to-br from-purple-500 to-purple-600" 
          delay={0.2}
        />
        <KPICard 
          title="Completed" 
          value={stats.completed} 
          cardBgClass="bg-gradient-to-br from-emerald-500 to-emerald-600" 
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
            placeholder="Search by client or artist email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all appearance-none sm:w-48"
          >
            <option value="">All Statuses</option>
            <option value="pending_payment">Pending Payment</option>
            <option value="in_progress">In Progress</option>
            <option value="delivered">Delivered</option>
            <option value="completed">Completed</option>
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
        <OrdersTable orders={orders} />
      )}

    </div>
  );
}
