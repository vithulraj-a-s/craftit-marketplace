import React from 'react';
import UserRow from './UserRow';

export default function UsersTable({ users }) {
  return (
    <div className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden mt-6">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 dark:border-slate-800/50">
              <th className="py-4 text-xs uppercase tracking-wider text-slate-400 font-semibold px-6">User Account</th>
              <th className="py-4 text-xs uppercase tracking-wider text-slate-400 font-semibold px-6">Role</th>
              <th className="py-4 text-xs uppercase tracking-wider text-slate-400 font-semibold px-6 hidden sm:table-cell">Verification</th>
              <th className="py-4 text-xs uppercase tracking-wider text-slate-400 font-semibold px-6 hidden md:table-cell">Status</th>
              <th className="py-4 text-xs uppercase tracking-wider text-slate-400 font-semibold px-6 hidden lg:table-cell">Joined Date</th>
              <th className="py-4 text-xs uppercase tracking-wider text-slate-400 font-semibold px-6 text-right"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, i) => (
              <UserRow key={user.id} user={user} index={i} />
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={6} className="py-16 text-center">
                  <p className="text-slate-500 dark:text-slate-400">No users found matching the current criteria.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
