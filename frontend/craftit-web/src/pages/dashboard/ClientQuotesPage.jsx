import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../services/axiosInstance';
import { Loader } from '../../components/ui/Loader';
import { Check, X } from 'lucide-react';
import clsx from 'clsx';

export default function ClientQuotesPage() {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/api/quotes/client/');
      setQuotes(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load quotes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  const handleQuoteAction = async (quoteId, status) => {
    setActionLoading(true);
    setActionError(null);
    try {
      await axiosInstance.patch(`/api/quotes/${quoteId}/status/`, { status });
      if (status === 'accepted') {
        navigate('/dashboard/client/orders');
      } else {
        await fetchQuotes();
      }
    } catch (err) {
      console.error(`Failed to update quote status:`, err);
      setActionError("Failed to process action. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const formatQuoteStatus = (status) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'accepted': return 'Accepted';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-[60vh]"><Loader size={48} /></div>;
  }

  return (
    <div className="max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Your Quotes</h1>
      </div>

      {error ? (
        <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-100 text-center font-bold">
          {error}
        </div>
      ) : actionError ? (
        <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex justify-between items-center text-sm font-bold">
          <span>{actionError}</span>
          <button onClick={() => setActionError(null)} className="text-red-400 hover:text-red-600">
            <X size={16} />
          </button>
        </div>
      ) : null}

      {!error && quotes.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100">
          <p className="text-xl text-gray-500 font-medium">No quotes available</p>
        </div>
      ) : (
        <div className="space-y-6">
          {quotes.map(quote => (
            <div key={quote.id} className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-shadow">
              
              <div className="space-y-4 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-sm font-bold tracking-wider">
                    Request #{quote.portrait_request}
                  </span>
                  <span className={clsx(
                    "px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider",
                    quote.status === 'pending' ? "bg-yellow-100 text-yellow-800" :
                    quote.status === 'accepted' ? "bg-green-100 text-green-800" :
                    "bg-red-100 text-red-800"
                  )}>
                    {formatQuoteStatus(quote.status)}
                  </span>
                </div>

                <div className="flex items-end gap-3">
                  <p className="text-3xl font-black text-indigo-600">₹{quote.amount}</p>
                </div>
                
                <p className="text-gray-600 font-medium">
                  Delivery in <span className="font-bold text-gray-900">{quote.delivery_days} days</span>
                </p>

                {quote.message && (
                  <div className="mt-2 text-gray-700 bg-gray-50 p-4 rounded-xl text-sm leading-relaxed border border-gray-100">
                    <p className="italic">"{quote.message}"</p>
                  </div>
                )}
              </div>

              <div className="flex flex-col items-start md:items-end gap-3 min-w-[200px] shrink-0">
                {quote.status === 'pending' && (
                  <div className="flex flex-col sm:flex-row md:flex-col gap-3 w-full">
                    <button 
                      onClick={() => handleQuoteAction(quote.id, "accepted")}
                      disabled={actionLoading}
                      className="w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-indigo-200 flex justify-center items-center gap-2"
                    >
                      {actionLoading ? "Processing..." : <><Check size={18} /> Accept</>}
                    </button>
                    <button 
                      onClick={() => handleQuoteAction(quote.id, "rejected")}
                      disabled={actionLoading}
                      className="w-full py-3 px-6 bg-white hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed text-red-600 border-2 border-red-100 rounded-xl font-bold text-sm transition-all flex justify-center items-center gap-2"
                    >
                      {actionLoading ? "Processing..." : <><X size={18} /> Reject</>}
                    </button>
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
