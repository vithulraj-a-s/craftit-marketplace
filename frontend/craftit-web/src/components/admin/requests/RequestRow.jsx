import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Clock, User, Palette, FileText } from 'lucide-react';

export default function RequestRow({ request, index }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30';
      case 'quote_sent': return 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30';
      case 'rejected': return 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30';
      case 'cancelled': return 'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-400 border border-slate-200 dark:border-slate-500/30';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-400 border border-slate-200 dark:border-slate-500/30';
    }
  };

  const formatStatus = (status) => status?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown';

  const getStyleBadgeColor = () => {
    return 'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-gray-300 border border-gray-200 dark:border-slate-700';
  };

  return (
    <>
      <motion.tr 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        onClick={() => setIsExpanded(!isExpanded)}
        className={`border-b border-gray-50 dark:border-slate-800/30 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer ${isExpanded ? 'bg-slate-50/50 dark:bg-slate-800/20' : ''}`}
      >
        <td className="py-4 px-6">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-slate-800 dark:text-white truncate max-w-[200px]">{request.title}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">#{request.id}</span>
          </div>
        </td>
        <td className="py-4 px-6 hidden sm:table-cell">
          <div className="flex flex-col">
            <span className="text-sm text-slate-800 dark:text-white truncate max-w-[150px]">{request.client_email}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Client</span>
          </div>
        </td>
        <td className="py-4 px-6 hidden md:table-cell">
          <div className="flex flex-col">
            <span className="text-sm text-slate-800 dark:text-white truncate max-w-[150px]">{request.artist_email}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Artist</span>
          </div>
        </td>
        <td className="py-4 px-6 hidden lg:table-cell">
          <span className={`text-xs px-2.5 py-1 rounded-md font-medium tracking-wide ${getStyleBadgeColor()}`}>
            {request.portrait_style?.toUpperCase()}
          </span>
        </td>
        <td className="py-4 px-6">
          <span className={`text-xs px-2.5 py-1 rounded-md font-medium tracking-wide ${getStatusBadgeColor(request.status)}`}>
            {formatStatus(request.status)}
          </span>
        </td>
        <td className="py-4 px-6">
          <span className="text-sm font-bold text-slate-800 dark:text-white">Rs. {request.budget}</span>
        </td>
        <td className="py-4 px-6 hidden xl:table-cell">
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {new Date(request.created_at).toLocaleDateString()}
          </span>
        </td>
        <td className="py-4 px-6 text-right text-slate-400">
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </td>
      </motion.tr>

      <AnimatePresence>
        {isExpanded && (
          <tr>
            <td colSpan={8} className="p-0 border-b border-gray-100 dark:border-slate-800/50 bg-gray-50/50 dark:bg-[#1E293B]/50">
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="p-6 md:p-8 flex flex-col lg:flex-row gap-8">
                  {/* Info Section */}
                  <div className="flex-1 space-y-6">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-4 border-b border-gray-200 dark:border-slate-700 pb-2">Request Overview</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Title</p>
                        <p className="text-sm font-medium text-slate-800 dark:text-white flex items-center gap-2">
                          <FileText size={14} className="text-slate-400" /> {request.title}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Style Requested</p>
                        <p className="text-sm font-medium text-slate-800 dark:text-white flex items-center gap-2">
                          <Palette size={14} className="text-slate-400" /> {request.portrait_style?.toUpperCase()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Client Contact</p>
                        <p className="text-sm font-medium text-slate-800 dark:text-white flex items-center gap-2">
                          <User size={14} className="text-slate-400" /> {request.client_email}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Artist Contact</p>
                        <p className="text-sm font-medium text-slate-800 dark:text-white flex items-center gap-2">
                          <User size={14} className="text-slate-400" /> {request.artist_email}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Created Date</p>
                        <p className="text-sm font-medium text-slate-800 dark:text-white flex items-center gap-2">
                          <Clock size={14} className="text-slate-400" /> {new Date(request.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Initial Budget</p>
                        <p className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1">
                          Rs. {request.budget}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="hidden lg:block w-px bg-gray-200 dark:bg-slate-700/50"></div>

                  {/* Workflow Inspection */}
                  <div className="flex-1 lg:max-w-md">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-4 border-b border-gray-200 dark:border-slate-700 pb-2">Workflow Status</h4>
                    <div className="bg-white dark:bg-slate-900/50 p-5 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col gap-4">
                      
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Current stage of the marketplace request workflow. Awaiting artist quote or client action.</p>
                      
                      <div className="flex items-center gap-3">
                        <span className={`text-sm px-3 py-1.5 rounded-lg font-medium tracking-wide border ${getStatusBadgeColor(request.status)}`}>
                          {formatStatus(request.status)}
                        </span>
                      </div>

                    </div>
                  </div>
                </div>
              </motion.div>
            </td>
          </tr>
        )}
      </AnimatePresence>
    </>
  );
}
