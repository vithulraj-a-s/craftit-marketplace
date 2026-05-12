import React, { useState, useEffect } from 'react';
import { Plus, Users, ShieldCheck, Activity, Search } from 'lucide-react';
import axiosInstance from '../../services/axiosInstance';
import KPICard from '../../components/admin/KPICard';
import StaffTable from '../../components/admin/staff/StaffTable';
import StaffModal from '../../components/admin/staff/StaffModal';
import { Loader } from '../../components/ui/Loader';

export default function StaffManagementPage() {
  const [staffData, setStaffData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchStaff = async () => {
    try {
      const response = await axiosInstance.get('/dashboard/staff/list/');
      setStaffData(response.data);
    } catch (error) {
      console.error('Failed to fetch staff data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleToggleStatus = (id, newStatus) => {
    setStaffData(prev => 
      prev.map(s => s.id === id ? { ...s, is_active: newStatus } : s)
    );
  };

  const handleEdit = (staff) => {
    setEditingStaff(staff);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingStaff(null);
    setIsModalOpen(true);
  };

  // Derived stats
  const totalStaff = staffData.length;
  const activeStaff = staffData.filter(s => s.is_active).length;
  const supportStaff = staffData.filter(s => s.staff_profile?.role === 'SUPPORT').length;
  const analystStaff = staffData.filter(s => s.staff_profile?.role === 'ANALYST').length;

  // Filtered list
  const filteredStaff = staffData.filter(staff => {
    const searchMatch = staff.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (staff.staff_profile?.full_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const roleMatch = roleFilter === 'ALL' || staff.staff_profile?.role === roleFilter;
    
    const statusMatch = statusFilter === 'ALL' || 
      (statusFilter === 'ACTIVE' && staff.is_active) || 
      (statusFilter === 'INACTIVE' && !staff.is_active);

    return searchMatch && roleMatch && statusMatch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <Loader size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Staff Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage platform administrators and operational roles</p>
        </div>
        <button 
          onClick={handleCreate}
          className="flex items-center gap-2 bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5"
        >
          <Plus size={18} />
          <span>Create Staff</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 gap-y-12 lg:gap-y-6 mt-4">
        <KPICard 
          title="Total Staff" 
          value={totalStaff} 
          cardBgClass="bg-gradient-to-br from-slate-700 to-slate-800" 
          delay={0}
        />
        <KPICard 
          title="Active Members" 
          value={activeStaff} 
          cardBgClass="bg-gradient-to-br from-emerald-500 to-emerald-600" 
          delay={0.1}
        />
        <KPICard 
          title="Support Team" 
          value={supportStaff} 
          cardBgClass="bg-gradient-to-br from-blue-500 to-blue-600" 
          delay={0.2}
        />
        <KPICard 
          title="Analysts" 
          value={analystStaff} 
          cardBgClass="bg-gradient-to-br from-cyan-500 to-cyan-600" 
          delay={0.3}
        />
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mt-8 bg-white dark:bg-[#1E293B] p-4 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all appearance-none sm:w-48"
        >
          <option value="ALL">All Roles</option>
          <option value="SUPER_ADMIN">Super Admin</option>
          <option value="SUPPORT">Support</option>
          <option value="ANALYST">Analyst</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all appearance-none sm:w-40"
        >
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      {/* Data Table */}
      <StaffTable 
        staffList={filteredStaff} 
        onEdit={handleEdit} 
        onToggleStatus={handleToggleStatus} 
      />

      {/* Modal */}
      <StaffModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        staffData={editingStaff}
        onSuccess={fetchStaff}
      />

    </div>
  );
}
