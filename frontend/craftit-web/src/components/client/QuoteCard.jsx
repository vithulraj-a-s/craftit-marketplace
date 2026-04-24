import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, ArrowRight } from 'lucide-react';

export default function QuoteCard({ quote, actionLoading, onAccept, onReject }) {
  const navigate = useNavigate();

  if (!quote) return null;

  return (
    <div className="bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-6 shadow-md mb-10 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500"></div>
      
      <div className="mb-4">
        <h2 className="text-xl font-extrabold text-indigo-900 mb-1">
          {quote.status === 'accepted' ? 'Quote Accepted' : 'Quote Received'}
        </h2>
        {quote.status === 'accepted' && (
           <p className="text-sm font-semibold text-indigo-700">You already accepted this quote.</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 pb-4 mb-4 border-b border-indigo-100/50">
        <div>
          <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">Amount</p>
          <p className="text-2xl font-black text-indigo-900">₹{quote.amount}</p>
        </div>
        <div>
           <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">Delivery Time</p>
           <p className="text-xl font-bold text-indigo-800">{quote.delivery_days} days</p>
        </div>
      </div>

      {quote.message && (
        <div className="mb-6">
          <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">Artist Message</p>
          <div className="bg-white/60 p-4 rounded-xl border border-indigo-100/50 text-indigo-900 font-medium italic">
            "{quote.message}"
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center gap-3 mt-2">
        {quote.status === 'pending' && (
          <>
            <button
              onClick={onAccept}
              disabled={actionLoading}
              className="w-full sm:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
            >
              <Check size={20} /> Accept Quote
            </button>
            <button
              onClick={onReject}
              disabled={actionLoading}
              className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-red-50 text-red-600 border border-red-200 font-bold rounded-xl transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
            >
              <X size={20} /> Reject Quote
            </button>
          </>
        )}

        {quote.status === 'accepted' && (
          <button
            onClick={() => navigate('/dashboard/client/orders')}
            className="w-full sm:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
          >
            Go to Orders <ArrowRight size={18} />
          </button>
        )}

        {quote.status === 'rejected' && (
          <div className="flex items-center gap-3">
             <span className="text-red-700 font-bold">You rejected this quote</span>
             <span className="px-4 py-2 bg-red-100 text-red-800 border border-red-200 font-extrabold rounded-xl flex items-center gap-2 text-sm">
               <X size={18} /> Rejected
             </span>
          </div>
        )}
      </div>
    </div>
  );
}
