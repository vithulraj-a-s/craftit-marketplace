import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-24 h-24 bg-rose-500/10 rounded-full flex items-center justify-center mb-6">
        <ShieldAlert size={48} className="text-rose-500" />
      </div>
      <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-3">Access Denied</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md">
        You do not have the required permissions to access this module. Please contact the platform owner if you believe this is a mistake.
      </p>
      <Link 
        to="/admin/dashboard" 
        className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors shadow-sm"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}
