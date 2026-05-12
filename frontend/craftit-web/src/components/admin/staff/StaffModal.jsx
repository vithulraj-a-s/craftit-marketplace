import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import axiosInstance from '../../../services/axiosInstance';

export default function StaffModal({ isOpen, onClose, staffData, onSuccess }) {
  const isEdit = !!staffData;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'SUPPORT',
    job_title: '',
    phone_number: '',
    department: '',
  });

  useEffect(() => {
    if (isOpen) {
      if (staffData) {
        setFormData({
          full_name: staffData.staff_profile?.full_name || '',
          email: staffData.email || '',
          password: '',
          role: staffData.staff_profile?.role || 'SUPPORT',
          job_title: staffData.staff_profile?.job_title || '',
          phone_number: staffData.staff_profile?.phone_number || '',
          department: staffData.staff_profile?.department || '',
        });
      } else {
        setFormData({
          full_name: '',
          email: '',
          password: '',
          role: 'SUPPORT',
          job_title: '',
          phone_number: '',
          department: '',
        });
      }
      setError('');
    }
  }, [isOpen, staffData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = { ...formData };
    if (isEdit && !payload.password) {
      delete payload.password;
    }

    try {
      if (isEdit) {
        await axiosInstance.patch(`/dashboard/staff/${staffData.id}/`, payload);
      } else {
        await axiosInstance.post('/dashboard/staff/', payload);
      }
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white dark:bg-[#1E293B] w-full max-w-xl rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-800/50">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">
              {isEdit ? 'Edit Staff Member' : 'Create Staff Member'}
            </h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 overflow-y-auto">
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-sm font-medium border border-rose-100 dark:border-rose-500/20">
                {error}
              </div>
            )}
            <form id="staff-form" onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                  <input required type="text" name="full_name" value={formData.full_name} onChange={handleChange} className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                  <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Role</label>
                  <select name="role" value={formData.role} onChange={handleChange} className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all appearance-none">
                    <option value="SUPPORT">Support</option>
                    <option value="ANALYST">Analyst</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password {isEdit && <span className="text-slate-400 font-normal text-xs">(Leave blank to keep)</span>}</label>
                  <input required={!isEdit} type="password" name="password" value={formData.password} onChange={handleChange} className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Job Title</label>
                  <input required type="text" name="job_title" value={formData.job_title} onChange={handleChange} className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Department</label>
                  <input required type="text" name="department" value={formData.department} onChange={handleChange} className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                  <input required type="text" name="phone_number" value={formData.phone_number} onChange={handleChange} className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all" />
                </div>
              </div>
            </form>
          </div>
          
          <div className="p-6 border-t border-gray-100 dark:border-slate-800/50 bg-gray-50 dark:bg-[#1E293B] flex justify-end gap-3 mt-auto">
            <button onClick={onClose} type="button" className="px-5 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-800 transition-colors">
              Cancel
            </button>
            <button form="staff-form" type="submit" disabled={loading} className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
              {loading && <Loader2 size={16} className="animate-spin" />}
              {isEdit ? 'Save Changes' : 'Create Staff'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
