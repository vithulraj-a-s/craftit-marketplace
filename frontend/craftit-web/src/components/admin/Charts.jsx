import React from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, BarChart, Bar } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-lg border border-gray-100 dark:border-slate-700">
        <p className="text-sm font-bold text-slate-800 dark:text-white mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const RevenueChart = ({ data }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-4 mt-8"
    >
      <div className="bg-linear-to-br from-emerald-500 to-emerald-600 rounded-xl p-4 -mt-8 mb-4 shadow-lg shadow-emerald-500/20">
        <h3 className="text-white font-bold tracking-wide">Weekly Revenue</h3>
        <p className="text-emerald-100 text-sm opacity-90">Performance over last 7 days</p>
        <div className="h-64 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.2)" />
              <XAxis dataKey="week" stroke="rgba(255,255,255,0.7)" tick={{ fill: 'rgba(255,255,255,0.7)' }} axisLine={false} tickLine={false} />
              <YAxis stroke="rgba(255,255,255,0.7)" tick={{ fill: 'rgba(255,255,255,0.7)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#ffffff" strokeWidth={3} dot={{ r: 4, fill: "#ffffff", strokeWidth: 0 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="pt-2 px-2">
        <h4 className="text-slate-800 dark:text-white font-bold">Revenue Trend</h4>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Platform earnings over time</p>
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-800/50 flex items-center text-sm text-slate-400">
          <span className="flex items-center">🕒 updated live</span>
        </div>
      </div>
    </motion.div>
  );
};

export const UsersGrowthChart = ({ data }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-4 mt-8"
    >
      <div className="bg-linear-to-br from-blue-500 to-blue-600 rounded-xl p-4 -mt-8 mb-4 shadow-lg shadow-blue-500/20">
        <h3 className="text-white font-bold tracking-wide">Weekly User Growth</h3>
        <p className="text-blue-100 text-sm opacity-90">New platform registrations</p>
        <div className="h-64 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.2)" />
              <XAxis dataKey="week" stroke="rgba(255,255,255,0.7)" tick={{ fill: 'rgba(255,255,255,0.7)' }} axisLine={false} tickLine={false} />
              <YAxis stroke="rgba(255,255,255,0.7)" tick={{ fill: 'rgba(255,255,255,0.7)' }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: 'rgba(255,255,255,0.1)' }} content={<CustomTooltip />} />
              <Area type="monotone" dataKey="users" name="Users" stroke="#ffffff" fill="#ffffff" fillOpacity={0.3} strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="pt-2 px-2">
        <h4 className="text-slate-800 dark:text-white font-bold">User Signups</h4>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Growth overview</p>
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-800/50 flex items-center text-sm text-slate-400">
          <span className="flex items-center">🕒 just updated</span>
        </div>
      </div>
    </motion.div>
  );
};

export const OrdersChart = ({ data }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-4 mt-8"
    >
      <div className="bg-linear-to-br from-slate-800 to-slate-900 rounded-xl p-4 -mt-8 mb-4 shadow-lg shadow-slate-900/20">
        <h3 className="text-white font-bold tracking-wide">Weekly Orders</h3>
        <p className="text-slate-300 text-sm opacity-90">Order volume over last 7 days</p>
        <div className="h-64 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="week" stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.5)' }} axisLine={false} tickLine={false} />
              <YAxis stroke="rgba(255,255,255,0.5)" tick={{ fill: 'rgba(255,255,255,0.5)' }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} content={<CustomTooltip />} />
              <Bar dataKey="orders" name="Orders" fill="#ffffff" radius={[4, 4, 0, 0]} barSize={8} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="pt-2 px-2">
        <h4 className="text-slate-800 dark:text-white font-bold">Orders Processed</h4>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Platform fulfillment metrics</p>
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-800/50 flex items-center text-sm text-slate-400">
          <span className="flex items-center">🕒 just updated</span>
        </div>
      </div>
    </motion.div>
  );
};
