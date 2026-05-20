import React, { useEffect, useState } from 'react';
import axiosInstance from '../../services/axiosInstance';
import KPICard from '../../components/admin/KPICard';
import { RevenueChart, UsersGrowthChart, OrdersChart } from '../../components/admin/Charts';
import { RecentOrdersTable } from '../../components/admin/DataTables';
import { ActivityFeed } from '../../components/admin/ActivityFeed';
import { Briefcase, Users, DollarSign, UserPlus, CheckCircle, Loader as LucideLoader, BadgeCheck, FileCheck } from 'lucide-react';
import { Loader } from '../../components/ui/Loader';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, chartsRes, activityRes] = await Promise.all([
          axiosInstance.get('/api/dashboard/stats/'),
          axiosInstance.get('/api/dashboard/charts/'),
          axiosInstance.get('/api/dashboard/activity/')
        ]);

        setData({
          stats: statsRes.data,
          charts: chartsRes.data,
          activity: activityRes.data
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-full min-h-125">
        <Loader size={40} />
      </div>
    );
  }

  const { stats, charts, activity } = data;

  return (
    <div className="max-w-350 mx-auto space-y-8 pb-8">
      
      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 gap-y-12 lg:gap-y-6 mt-4">
        <KPICard 
          title="Total Orders" 
          value={stats.orders?.total_orders || 0} 
          icon={Briefcase} 
          colorClass="bg-gradient-to-br from-slate-700 to-slate-800" 
          delay={0}
          trend="up"
          trendValue={stats.orders?.completed || 0}
          subtitle="completed orders"
        />
        <KPICard 
          title="Total Users" 
          value={stats.users?.total_users || 0} 
          icon={Users} 
          colorClass="bg-gradient-to-br from-blue-500 to-blue-600" 
          delay={0.1}
          trend="up"
          trendValue={stats.users?.total_artists || 0}
          subtitle="active artists"
        />
        <KPICard 
          title="Total Revenue" 
          value={`Rs. ${((stats.payments?.total_revenue || 0) / 1000).toFixed(1)}k`} 
          icon={DollarSign} 
          colorClass="bg-gradient-to-br from-emerald-500 to-emerald-600" 
          delay={0.2}
          trend="up"
          trendValue={stats.payments?.successful_payments || 0}
          subtitle="successful payments"
        />
        <KPICard 
          title="Pending Requests" 
          value={stats.requests?.pending_requests || 0} 
          icon={UserPlus} 
          colorClass="bg-gradient-to-br from-rose-500 to-rose-600" 
          delay={0.3}
          subtitle="awaiting artist quotes"
        />
      </div>

      {/* Second KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 gap-y-12 lg:gap-y-6 mt-6">
        <KPICard 
          title="Completed Orders" 
          value={stats.orders?.completed || 0} 
          icon={CheckCircle} 
          colorClass="bg-gradient-to-br from-emerald-500 to-slate-800" 
          delay={0.4}
          subtitle="successfully delivered"
        />
        <KPICard 
          title="In Progress Orders" 
          value={stats.orders?.in_progress || 0} 
          icon={LucideLoader} 
          colorClass="bg-gradient-to-br from-blue-500 to-slate-800" 
          delay={0.5}
          subtitle="currently active"
        />
        <KPICard 
          title="Verified Users" 
          value={stats.users?.verified_users || 0} 
          icon={BadgeCheck} 
          colorClass="bg-gradient-to-br from-cyan-500 to-slate-800" 
          delay={0.6}
          subtitle="trusted accounts"
        />
        <KPICard 
          title="Accepted Quotes" 
          value={stats.quotes?.accepted_quotes || 0} 
          icon={FileCheck} 
          colorClass="bg-gradient-to-br from-amber-500 to-slate-800" 
          delay={0.7}
          subtitle="client approved"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 gap-y-12 lg:gap-y-6 mt-6">
        <UsersGrowthChart data={charts.weekly_users} />
        <RevenueChart data={charts.weekly_revenue} />
        <OrdersChart data={charts.weekly_orders} />
      </div>

      {/* Tables and Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2">
          <RecentOrdersTable orders={activity.recent_orders} />
        </div>
        <div>
          <ActivityFeed 
            users={activity.recent_users} 
            payments={activity.recent_payments} 
            requests={activity.recent_requests} 
          />
        </div>
      </div>

    </div>
  );
}
