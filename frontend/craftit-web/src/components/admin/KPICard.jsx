import React from 'react';
import { motion } from 'framer-motion';

export default function KPICard({ title, value, icon: Icon, colorClass, delay = 0, trend, trendValue, subtitle, cardBgClass }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`relative ${cardBgClass || 'bg-white dark:bg-[#1E293B]'} rounded-2xl p-4 pt-5 shadow-sm border border-gray-100 dark:border-slate-800 mt-6`}
    >
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <span className={`text-sm ${cardBgClass ? 'text-white/80' : 'text-gray-500 dark:text-slate-400'} font-medium mb-1`}>{title}</span>
          <span className={`text-2xl font-bold ${cardBgClass ? 'text-white' : 'text-slate-800 dark:text-white'}`}>{value}</span>
        </div>
        
        {/* Floating Icon Box */}
        {Icon && (
          <div className={`absolute -top-5 right-4 w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg ${colorClass}`}>
            <Icon size={24} />
          </div>
        )}
      </div>
      
      {(trend || subtitle) && (
        <div className={`mt-5 pt-4 border-t ${cardBgClass ? 'border-white/20' : 'border-gray-100 dark:border-slate-800/50'}`}>
          <p className={`text-sm ${cardBgClass ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`}>
            {trend === 'up' && <span className={`${cardBgClass ? 'text-white' : 'text-emerald-500'} font-bold mr-1`}>{trendValue}</span>}
            {trend === 'down' && <span className={`${cardBgClass ? 'text-white' : 'text-rose-500'} font-bold mr-1`}>{trendValue}</span>}
            {subtitle}
          </p>
        </div>
      )}
    </motion.div>
  );
}
