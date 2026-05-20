import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Loader2, CheckCircle2, XCircle, ShieldCheck, ShieldAlert, Mail } from 'lucide-react';
import axiosInstance from '../../../services/axiosInstance';

export default function UserRow({ user, index }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isActive, setIsActive] = useState(user.is_active);
  const [isVerified, setIsVerified] = useState(user.is_verified);
  const [loadingActive, setLoadingActive] = useState(false);
  const [loadingVerified, setLoadingVerified] = useState(false);

  const handleToggleActive = async (e) => {
    e.stopPropagation();
    setLoadingActive(true);
    try {
      await axiosInstance.patch(`/api/dashboard/users/${user.id}/`, { is_active: !isActive });
      setIsActive(!isActive);
    } catch (err) {
      console.error('Error toggling active status', err);
    } finally {
      setLoadingActive(false);
    }
  };

  const handleToggleVerified = async (e) => {
    e.stopPropagation();
    setLoadingVerified(true);
    try {
      await axiosInstance.patch(`/api/dashboard/users/${user.id}/`, { is_verified: !isVerified });
      setIsVerified(!isVerified);
    } catch (err) {
      console.error('Error toggling verified status', err);
    } finally {
      setLoadingVerified(false);
    }
  };

  const getRoleBadgeColor = (role) => {
    if (role === 'ARTIST') return 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400';
    if (role === 'CLIENT') return 'bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-400';
    return 'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-400';
  };

  const getInitials = (email) => {
    return email ? email.charAt(0).toUpperCase() : 'U';
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
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-xs shadow-sm">
              {getInitials(user.email)}
            </div>
            <span className="text-sm font-semibold text-slate-800 dark:text-white truncate max-w-[200px] sm:max-w-[300px]">
              {user.email}
            </span>
          </div>
        </td>
        <td className="py-4 px-6">
          <span className={`text-xs px-2.5 py-1 rounded-md font-medium tracking-wide ${getRoleBadgeColor(user.role)}`}>
            {user.role}
          </span>
        </td>
        <td className="py-4 px-6 hidden sm:table-cell">
          <div className="flex items-center gap-1.5">
            {isVerified ? (
              <><ShieldCheck size={14} className="text-emerald-500" /> <span className="text-sm text-slate-600 dark:text-slate-300">Verified</span></>
            ) : (
              <><ShieldAlert size={14} className="text-amber-500" /> <span className="text-sm text-slate-600 dark:text-slate-300">Unverified</span></>
            )}
          </div>
        </td>
        <td className="py-4 px-6 hidden md:table-cell">
          <div className="flex items-center gap-1.5">
            {isActive ? (
              <><CheckCircle2 size={14} className="text-blue-500" /> <span className="text-sm text-slate-600 dark:text-slate-300">Active</span></>
            ) : (
              <><XCircle size={14} className="text-rose-500" /> <span className="text-sm text-slate-600 dark:text-slate-300">Inactive</span></>
            )}
          </div>
        </td>
        <td className="py-4 px-6 hidden lg:table-cell">
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {new Date(user.created_at).toLocaleDateString()}
          </span>
        </td>
        <td className="py-4 px-6 text-right text-slate-400">
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </td>
      </motion.tr>

      <AnimatePresence>
        {isExpanded && (
          <tr>
            <td colSpan={6} className="p-0 border-b border-gray-100 dark:border-slate-800/50 bg-gray-50/50 dark:bg-[#1E293B]/50">
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
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-4 border-b border-gray-200 dark:border-slate-700 pb-2">User Details</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Email Address</p>
                        <p className="text-sm font-medium text-slate-800 dark:text-white flex items-center gap-2">
                          <Mail size={14} className="text-slate-400" /> {user.email}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Platform Role</p>
                        <p className="text-sm font-medium text-slate-800 dark:text-white">{user.role}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Joined Date</p>
                        <p className="text-sm font-medium text-slate-800 dark:text-white">
                          {new Date(user.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">User ID</p>
                        <p className="text-sm font-medium text-slate-800 dark:text-white font-mono">{user.id}</p>
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="hidden lg:block w-px bg-gray-200 dark:bg-slate-700/50"></div>

                  {/* Moderation Controls */}
                  <div className="flex-1 lg:max-w-md">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-4 border-b border-gray-200 dark:border-slate-700 pb-2">Moderation Controls</h4>
                    <div className="space-y-5 bg-white dark:bg-slate-900/50 p-5 rounded-xl border border-gray-100 dark:border-slate-800 shadow-sm">
                      
                      {/* Verify Toggle */}
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-800 dark:text-white">Verification Status</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Approve user identity</p>
                        </div>
                        <button 
                          onClick={handleToggleVerified}
                          disabled={loadingVerified}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ease-in-out focus:outline-none ${
                            isVerified ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-300 ease-in-out flex items-center justify-center ${
                            isVerified ? 'translate-x-6' : 'translate-x-1'
                          }`}>
                            {loadingVerified && <Loader2 size={12} className="animate-spin text-slate-800" />}
                          </span>
                        </button>
                      </div>

                      {/* Active Toggle */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-slate-800/50">
                        <div>
                          <p className="text-sm font-medium text-slate-800 dark:text-white">Account Access</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Enable or disable login</p>
                        </div>
                        <button 
                          onClick={handleToggleActive}
                          disabled={loadingActive}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ease-in-out focus:outline-none ${
                            isActive ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-700'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-300 ease-in-out flex items-center justify-center ${
                            isActive ? 'translate-x-6' : 'translate-x-1'
                          }`}>
                            {loadingActive && <Loader2 size={12} className="animate-spin text-slate-800" />}
                          </span>
                        </button>
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
