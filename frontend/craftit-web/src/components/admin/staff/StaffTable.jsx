import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Pencil, Loader2 } from 'lucide-react';
import axiosInstance from '../../../services/axiosInstance';

export default function StaffTable({ staffList, onEdit, onToggleStatus }) {
  const [togglingId, setTogglingId] = useState(null);

  const handleToggle = async (id, currentStatus) => {
    setTogglingId(id);
    try {
      await axiosInstance.patch(`/dashboard/staff/${id}/toggle/`);
      onToggleStatus(id, !currentStatus);
    } catch (error) {
      console.error("Failed to toggle staff status", error);
    } finally {
      setTogglingId(null);
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400';
      case 'SUPPORT': return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400';
      case 'ANALYST': return 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-400';
    }
  };

  return (
    <div className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 dark:border-slate-800/50">
              <th className="py-4 text-xs uppercase tracking-wider text-slate-400 font-semibold px-6">Staff Member</th>
              <th className="py-4 text-xs uppercase tracking-wider text-slate-400 font-semibold px-6">Role</th>
              <th className="py-4 text-xs uppercase tracking-wider text-slate-400 font-semibold px-6">Department</th>
              <th className="py-4 text-xs uppercase tracking-wider text-slate-400 font-semibold px-6 text-center">Status</th>
              <th className="py-4 text-xs uppercase tracking-wider text-slate-400 font-semibold px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {staffList.map((staff, i) => (
              <motion.tr 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                key={staff.id} 
                className="border-b border-gray-50 dark:border-slate-800/30 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <td className="py-4 px-6">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-800 dark:text-white">{staff.staff_profile?.full_name || 'N/A'}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{staff.email}</span>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className={`text-xs px-2.5 py-1 rounded-md font-medium ${getRoleBadgeColor(staff.staff_profile?.role)}`}>
                    {staff.staff_profile?.role?.replace('_', ' ')}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex flex-col">
                    <span className="text-sm text-slate-700 dark:text-slate-300">{staff.staff_profile?.department || 'N/A'}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{staff.staff_profile?.job_title || 'N/A'}</span>
                  </div>
                </td>
                <td className="py-4 px-6 text-center">
                  <div className="flex justify-center">
                    <button 
                      onClick={() => handleToggle(staff.id, staff.is_active)}
                      disabled={togglingId === staff.id}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ease-in-out focus:outline-none ${
                        staff.is_active ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-300 ease-in-out flex items-center justify-center ${
                          staff.is_active ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      >
                        {togglingId === staff.id && <Loader2 size={12} className="animate-spin text-slate-800" />}
                      </span>
                    </button>
                  </div>
                </td>
                <td className="py-4 px-6 text-right">
                  <button 
                    onClick={() => onEdit(staff)}
                    className="p-2 text-slate-400 hover:text-blue-500 transition-colors"
                    title="Edit Staff"
                  >
                    <Pencil size={18} />
                  </button>
                </td>
              </motion.tr>
            ))}
            {staffList.length === 0 && (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-500">
                  No staff members found matching criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
