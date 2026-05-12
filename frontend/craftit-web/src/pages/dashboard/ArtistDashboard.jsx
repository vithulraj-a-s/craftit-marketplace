import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../services/axiosInstance';
import { Loader } from '../../components/ui/Loader';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';

export default function ArtistDashboard() {
  const { user } = useAuth();
  const displayName = user?.email ? user.email.split('@')[0] : 'Artist';
  
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/api/orders/dashboard/artist/');
        if (isMounted) {
          setDashboardData(response.data);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        if (isMounted) {
          setError("Failed to load dashboard data.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    fetchDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) return <div className="flex justify-center items-center h-[60vh]"><Loader size={48} /></div>;
  if (error) return <div className="text-center text-red-600 mt-10 font-bold">{error}</div>;
  if (!dashboardData) return null;

  const { overview, earnings_chart, orders_distribution, portrait_requests, recent_activity } = dashboardData;

  // Pie chart data mapping
  const pieDataRaw = [
    { name: 'Completed', value: orders_distribution?.completed || 0, color: '#10B981' }, // Green
    { name: 'Pending', value: orders_distribution?.pending || 0, color: '#9CA3AF' },   // Gray
    { name: 'In Progress', value: orders_distribution?.in_progress || 0, color: '#F59E0B' }, // Yellow
  ];

  // Filter out zeroes for the chart, but keep them for the legend if requested. We will just render what we have.
  // Recharts handles 0 values ok, but to make it cleaner we can use the raw data.
  const pieData = pieDataRaw.filter(item => item.value > 0);

  const formatStatus = (status) => {
    if (!status) return '';
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getStatusColor = (status) => {
    const s = status?.toLowerCase();
    if (s === 'delivered' || s === 'completed') return 'bg-green-100 text-green-800';
    if (s === 'in_progress') return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800'; // pending
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-8">
        Welcome back, {displayName}
      </h1>

      {/* Top -> Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white shadow rounded-xl p-6 border border-gray-100">
          <p className="text-sm font-medium text-gray-500 mb-1">Total Earnings</p>
          <p className="text-3xl font-bold text-gray-900">₹{overview?.total_earnings || 0}</p>
        </div>
        <div className="bg-white shadow rounded-xl p-6 border border-gray-100">
          <p className="text-sm font-medium text-gray-500 mb-1">Total Orders</p>
          <p className="text-3xl font-bold text-gray-900">{overview?.total_orders || 0}</p>
        </div>
        <div className="bg-white shadow rounded-xl p-6 border border-gray-100">
          <p className="text-sm font-medium text-gray-500 mb-1">In Progress Orders</p>
          <p className="text-3xl font-bold text-gray-900">{overview?.in_progress_orders || 0}</p>
        </div>
        <div className="bg-white shadow rounded-xl p-6 border border-gray-100">
          <p className="text-sm font-medium text-gray-500 mb-1">Pending Quotes</p>
          <p className="text-3xl font-bold text-gray-900">{portrait_requests?.pending_quotes || 0}</p>
        </div>
      </div>

      {/* Middle -> Charts (2 columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Earnings Chart */}
        <div className="bg-white shadow rounded-xl p-6 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Earnings Overview</h3>
          {(!earnings_chart || earnings_chart.length === 0) ? (
            <div className="h-64 flex items-center justify-center text-gray-400">No data available</div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={earnings_chart}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tickMargin={10} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `₹${value}`} tickMargin={10} />
                  <RechartsTooltip cursor={{fill: '#f3f4f6'}} formatter={(value) => [`₹${value}`, 'Earnings']} />
                  <Bar dataKey="earnings" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Orders Distribution Pie Chart */}
        <div className="bg-white shadow rounded-xl p-6 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Orders Distribution</h3>
          {pieData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-400">No data available</div>
          ) : (
            <div className="h-64 w-full flex flex-col">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-4">
                {pieDataRaw.map((entry) => (
                  <div key={entry.name} className="flex items-center text-sm">
                    <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }}></span>
                    <span className="text-gray-600">{entry.name} ({entry.value})</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom -> Recent activity table */}
      <div className="bg-white shadow rounded-xl overflow-hidden border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
        </div>
        <div className="overflow-x-auto">
          {(!recent_activity || recent_activity.length === 0) ? (
            <div className="p-6 text-center text-gray-500">No recent activity</div>
          ) : (
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Order ID</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recent_activity.slice(0, 5).map((activity) => (
                  <tr key={activity.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      #{activity.id}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${getStatusColor(activity.status)}`}>
                        {formatStatus(activity.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">
                      ₹{activity.price}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
