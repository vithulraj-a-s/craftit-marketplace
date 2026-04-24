import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getClientPortraitRequests } from '../../services/portraitRequestService';
import { Loader } from '../../components/ui/Loader';
import { Calendar, DollarSign, ArrowRight, Image as ImageIcon } from 'lucide-react';
import clsx from 'clsx';

export default function ClientRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await getClientPortraitRequests();
        setRequests(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load your commission requests.");
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-[60vh]"><Loader size={40} /></div>;
  if (error) return <div className="p-8 text-center text-red-500 font-bold">{error}</div>;

  const sortedRequests = [...requests].sort((a, b) => {
    const statusOrder = { quote_sent: 1, pending: 2, rejected: 3, cancelled: 4 };
    const orderA = statusOrder[a.status] || 5;
    const orderB = statusOrder[b.status] || 5;
    return orderA - orderB;
  });

  return (
    <div className="max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Requests</h1>
          <p className="text-sm text-gray-500">Track and manage your ongoing commission requests.</p>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 border-dashed p-12 flex flex-col items-center justify-center text-center">
          <div className="bg-gray-50 p-4 rounded-full mb-4">
            <ImageIcon size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No requests yet.</h3>
          <p className="text-gray-500 max-w-sm mb-6">Browse artists and submit a commission request to get started.</p>
          <Link
            to="/artists"
            className="text-white bg-indigo-600 font-semibold hover:bg-indigo-700 px-6 py-2.5 rounded-lg transition-colors"
          >
            Find Artists
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {sortedRequests.map(req => {
            const isQuoteSent = req.status === 'quote_sent';
            return (
            <div key={req.id} className={clsx(
              "rounded-2xl border shadow-sm p-6 flex flex-col sm:flex-row sm:items-center gap-6 transition-colors",
              isQuoteSent ? "bg-indigo-50 border-indigo-300 border-2" : "bg-white border-gray-200 hover:border-indigo-200"
            )}>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold text-lg text-gray-900">{req.title}</h3>
                  {isQuoteSent ? (
                    <span className="px-4 py-1.5 bg-indigo-600 text-white rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">Quote Received</span>
                  ) : req.status === 'pending' ? (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold uppercase tracking-wider">Pending</span>
                  ) : req.status === 'rejected' ? (
                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold uppercase tracking-wider">Rejected</span>
                  ) : req.status === 'cancelled' ? (
                    <span className="px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-xs font-bold uppercase tracking-wider">Cancelled</span>
                  ) : (
                    <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-bold uppercase tracking-wider">{req.status}</span>
                  )}
                </div>

                {isQuoteSent ? (
                  <div className="mb-4">
                    {req.quote && (
                      <p className="font-black text-indigo-900 text-lg mb-1">
                        Rs {req.quote.amount} • {req.quote.delivery_days} days
                      </p>
                    )}
                    <p className="text-indigo-700 font-semibold text-sm">Your artist has sent you a quote.</p>
                  </div>
                ) : req.status === 'pending' ? (
                  <p className="text-yellow-700 font-medium text-sm mb-4">Waiting for artist response</p>
                ) : req.status === 'rejected' ? (
                  <p className="text-red-600 font-medium text-sm mb-4">The artist declined this request</p>
                ) : req.status === 'cancelled' ? (
                  <p className="text-gray-500 font-medium text-sm mb-4">You cancelled this request</p>
                ) : null}

                <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-gray-600 font-medium">
                  <div><span className="text-gray-400">Artist:</span> <Link to={`/artists/${req.artist_slug}`} className="text-indigo-600 hover:underline">{req.artist?.display_name || req.artist_slug}</Link></div>
                  <div className="capitalize"><span className="text-gray-400">Style:</span> {req.portrait_style}</div>
                  <div className="flex items-center gap-1"><DollarSign size={14} className="text-gray-400"/> {req.budget ? req.budget : 'Open'}</div>
                  <div className="flex items-center gap-1"><Calendar size={14} className="text-gray-400"/> {new Date(req.created_at).toLocaleDateString()}</div>
                </div>
              </div>
              <div className="flex-shrink-0 flex items-center">
                {isQuoteSent ? (
                  <Link 
                    to={`/dashboard/client/requests/${req.id}`}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm rounded-xl transition-all shadow-md active:scale-95"
                  >
                    View Quote <ArrowRight size={16} />
                  </Link>
                ) : (
                  <Link 
                    to={`/dashboard/client/requests/${req.id}`}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-900 font-bold text-sm rounded-xl transition-colors border border-gray-200"
                  >
                    View Details <ArrowRight size={16} />
                  </Link>
                )}
              </div>
            </div>
          )})}
        </div>
      )}
    </div>
  );
}
