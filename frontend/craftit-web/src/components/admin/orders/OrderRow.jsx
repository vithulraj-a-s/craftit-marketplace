import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Loader2, Clock, CheckCircle2, XCircle, User, Palette } from 'lucide-react';
import axiosInstance from '../../../services/axiosInstance';

export default function OrderRow({ order, index }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [targetStatus, setTargetStatus] = useState(order.status);
  const [errorMsg, setErrorMsg] = useState('');
  const [currentOrder, setCurrentOrder] = useState(order);

  const handleUpdateStatus = async () => {
    if (targetStatus === currentOrder.status) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const response = await axiosInstance.patch(`/dashboard/orders/${currentOrder.id}/`, { status: targetStatus });
      setCurrentOrder(response.data.order || { ...currentOrder, status: targetStatus });
    } catch (err) {
      console.error('Error updating order status', err);
      setErrorMsg(err.response?.data?.error || err.response?.data?.message || 'Failed to update order status');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'pending_payment': return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30';
      case 'in_progress': return 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30';
      case 'delivered': return 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30';
      case 'completed': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30';
      case 'cancelled': return 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-400 border border-slate-200 dark:border-slate-500/30';
    }
  };

  const formatStatus = (status) => status?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown';

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
          <span className="text-sm font-bold text-slate-800 dark:text-white font-mono">#{currentOrder.id}</span>
        </td>
        <td className="py-4 px-6 hidden sm:table-cell">
          <div className="flex flex-col">
            <span className="text-sm text-slate-800 dark:text-white truncate max-w-[150px]">{currentOrder.client_email}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Client</span>
          </div>
        </td>
        <td className="py-4 px-6 hidden md:table-cell">
          <div className="flex flex-col">
            <span className="text-sm text-slate-800 dark:text-white truncate max-w-[150px]">{currentOrder.artist_email}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Artist</span>
          </div>
        </td>
        <td className="py-4 px-6">
          <span className={`text-xs px-2.5 py-1 rounded-md font-medium tracking-wide ${getStatusBadgeColor(currentOrder.status)}`}>
            {formatStatus(currentOrder.status)}
          </span>
        </td>
        <td className="py-4 px-6">
          <span className="text-sm font-bold text-slate-800 dark:text-white">Rs. {currentOrder.amount}</span>
        </td>
        <td className="py-4 px-6 hidden lg:table-cell">
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {new Date(currentOrder.created_at).toLocaleDateString()}
          </span>
        </td>
        <td className="py-4 px-6 text-right text-slate-400">
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </td>
      </motion.tr>

      <AnimatePresence>
        {isExpanded && (
          <tr>
            <td colSpan={7} className="p-0 border-b border-gray-100 dark:border-slate-800/50 bg-gray-50/50 dark:bg-[#1E293B]/50">
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
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-4 border-b border-gray-200 dark:border-slate-700 pb-2">Order Details</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Client</p>
                        <p className="text-sm font-medium text-slate-800 dark:text-white flex items-center gap-2">
                          <User size={14} className="text-slate-400" /> {currentOrder.client_email}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Artist</p>
                        <p className="text-sm font-medium text-slate-800 dark:text-white flex items-center gap-2">
                          <Palette size={14} className="text-slate-400" /> {currentOrder.artist_email}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Created Date</p>
                        <p className="text-sm font-medium text-slate-800 dark:text-white flex items-center gap-2">
                          <Clock size={14} className="text-slate-400" /> {new Date(currentOrder.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Completed Date</p>
                        <p className="text-sm font-medium text-slate-800 dark:text-white flex items-center gap-2">
                          {currentOrder.completed_at ? (
                            <><CheckCircle2 size={14} className="text-emerald-500" /> {new Date(currentOrder.completed_at).toLocaleString()}</>
                          ) : (
                            <><Clock size={14} className="text-slate-400" /> Not completed yet</>
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Order Amount</p>
                        <p className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1">
                          Rs. {currentOrder.amount}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="hidden lg:block w-px bg-gray-200 dark:bg-slate-700/50"></div>

                  {/* Workflow Controls */}
                  <div className="flex-1 lg:max-w-md">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-4 border-b border-gray-200 dark:border-slate-700 pb-2">Workflow Manager</h4>
                    <div className="bg-white dark:bg-slate-900/50 p-5 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col gap-4">
                      
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Update the lifecycle stage of this order. Backend rules will enforce required deliverables before transitions.</p>
                      
                      <div className="flex flex-col sm:flex-row gap-3">
                        <select
                          value={targetStatus}
                          onChange={(e) => setTargetStatus(e.target.value)}
                          className="flex-1 bg-gray-50 dark:bg-[#1E293B] border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all appearance-none"
                        >
                          <option value="pending_payment">Pending Payment</option>
                          <option value="in_progress">In Progress</option>
                          <option value="delivered">Delivered</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <button
                          onClick={handleUpdateStatus}
                          disabled={loading || targetStatus === currentOrder.status}
                          className="flex items-center justify-center gap-2 bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading && <Loader2 size={14} className="animate-spin" />}
                          Update Status
                        </button>
                      </div>

                      {errorMsg && (
                        <div className="mt-2 p-3 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-medium border border-rose-100 dark:border-rose-500/20 flex items-start gap-2">
                          <XCircle size={14} className="shrink-0 mt-0.5" />
                          <span>{errorMsg}</span>
                        </div>
                      )}
                      
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
