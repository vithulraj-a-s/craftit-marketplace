import React from 'react';
import { motion } from 'framer-motion';
import { Bell, ShoppingCart, DollarSign, UserPlus } from 'lucide-react';

export const ActivityFeed = ({ users, payments, requests }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-6"
    >
      <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Platform Activity</h3>
      
      <div className="relative pl-6 border-l-2 border-gray-100 dark:border-slate-700 space-y-8 mt-4 ml-2">
        {payments?.slice(0,2).map((p, i) => (
          <div key={`p-${i}`} className="relative">
            <span className="absolute -left-[35px] top-1 rounded-full p-1.5 bg-emerald-500 text-white shadow-sm ring-4 ring-white dark:ring-[#1E293B]">
              <DollarSign size={14} />
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-800 dark:text-white">Rs. {p.amount}, Payment {p.status}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">{p.created_at}</span>
            </div>
          </div>
        ))}
        
        {users?.slice(0,2).map((u, i) => (
          <div key={`u-${i}`} className="relative">
            <span className="absolute -left-[35px] top-1 rounded-full p-1.5 bg-blue-500 text-white shadow-sm ring-4 ring-white dark:ring-[#1E293B]">
              <UserPlus size={14} />
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-800 dark:text-white">New {(u.staff_profile?.role || "staff").toLowerCase()}: {u.email}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">{u.created_at}</span>
            </div>
          </div>
        ))}

        {requests?.slice(0,2).map((r, i) => (
          <div key={`r-${i}`} className="relative">
            <span className="absolute -left-[35px] top-1 rounded-full p-1.5 bg-rose-500 text-white shadow-sm ring-4 ring-white dark:ring-[#1E293B]">
              <Bell size={14} />
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-800 dark:text-white">Request: {r.title} ({r.status})</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">recently updated</span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
