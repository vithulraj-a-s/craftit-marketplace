import React from 'react';
import OrderRow from './OrderRow';

export default function OrdersTable({ orders }) {
  return (
    <div className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden mt-6">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 dark:border-slate-800/50">
              <th className="py-4 text-xs uppercase tracking-wider text-slate-400 font-semibold px-6">Order ID</th>
              <th className="py-4 text-xs uppercase tracking-wider text-slate-400 font-semibold px-6 hidden sm:table-cell">Client</th>
              <th className="py-4 text-xs uppercase tracking-wider text-slate-400 font-semibold px-6 hidden md:table-cell">Artist</th>
              <th className="py-4 text-xs uppercase tracking-wider text-slate-400 font-semibold px-6">Status</th>
              <th className="py-4 text-xs uppercase tracking-wider text-slate-400 font-semibold px-6">Amount</th>
              <th className="py-4 text-xs uppercase tracking-wider text-slate-400 font-semibold px-6 hidden lg:table-cell">Created Date</th>
              <th className="py-4 text-xs uppercase tracking-wider text-slate-400 font-semibold px-6 text-right"></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, i) => (
              <OrderRow key={order.id} order={order} index={i} />
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={7} className="py-16 text-center">
                  <p className="text-slate-500 dark:text-slate-400">No orders found matching the current criteria.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
