import React from 'react';
import { motion } from 'framer-motion';

export const RecentOrdersTable = ({ orders }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-6 overflow-hidden"
    >
      <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Recent Orders</h3>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 dark:border-slate-800/50">
              <th className="pb-3 text-xs uppercase tracking-wider text-slate-400 font-semibold px-4">Order ID</th>
              <th className="pb-3 text-xs uppercase tracking-wider text-slate-400 font-semibold px-4">Client</th>
              <th className="pb-3 text-xs uppercase tracking-wider text-slate-400 font-semibold px-4">Artist</th>
              <th className="pb-3 text-xs uppercase tracking-wider text-slate-400 font-semibold px-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders?.map((order, i) => (
              <tr key={i} className="border-b border-gray-50 dark:border-slate-800/30 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="py-4 px-4 text-sm font-medium text-slate-700 dark:text-slate-300">#{order.id}</td>
                <td className="py-4 px-4 text-sm text-slate-600 dark:text-slate-400">{order.client}</td>
                <td className="py-4 px-4 text-sm text-slate-600 dark:text-slate-400">{order.artist}</td>
                <td className="py-4 px-4 text-center">
                  <span className={`text-xs px-2.5 py-1 rounded-md font-medium ${
                    order.status === 'completed' || order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
                    order.status === 'in_progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' :
                    'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                  }`}>
                    {order.status.replace('_', ' ')}
                  </span>
                </td>
              </tr>
            ))}
            {(!orders || orders.length === 0) && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-500">No recent orders.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};
