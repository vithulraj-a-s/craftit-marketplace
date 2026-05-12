import React, { useEffect, useState } from 'react';
import { getArtistQuotes } from '../../services/quoteService';
import { Loader } from '../../components/ui/Loader';
import { FileText, IndianRupee, Clock, CheckCircle, AlertCircle, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ArtistQuotesPage() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      const data = await getArtistQuotes();
      setQuotes(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load your quotes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'pending':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-800',
          icon: <Clock size={20} className="text-yellow-600" />,
          label: 'Waiting for client response'
        };
      case 'accepted':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-800',
          icon: <CheckCircle size={20} className="text-green-600" />,
          label: 'Client accepted your quote'
        };
      case 'rejected':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-800',
          icon: <AlertCircle size={20} className="text-red-600" />,
          label: 'Client rejected your quote'
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-800',
          icon: <FileText size={20} className="text-gray-600" />,
          label: status
        };
    }
  };

  if (loading) return <div className="flex justify-center items-center h-[60vh]"><Loader size={48} /></div>;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">My Quotes</h1>
        <p className="text-gray-600 text-lg">Track the quotes you've sent to clients.</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 mb-8 font-bold">
          {error}
        </div>
      )}

      {quotes.length === 0 && !error ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center shadow-sm">
          <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText size={40} className="text-gray-300" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">No Quotes Sent</h2>
          <p className="text-gray-500 max-w-md mx-auto mb-8 text-lg">
            You haven't sent any quotes yet. Browse client requests to find new commissions.
          </p>
          <Link to="/dashboard/artist/requests" className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors inline-block">
            View Requests
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {quotes.map((quote) => {
            const statusConfig = getStatusDisplay(quote.status);
            return (
              <div key={quote.id} className="bg-white border text-left border-gray-200 rounded-3xl shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md">
                <div className={`p-4 border-b border-gray-100 flex items-center gap-3 ${statusConfig.bg}`}>
                   <div className="bg-white p-2 rounded-full shadow-sm">
                     {statusConfig.icon}
                   </div>
                   <span className={`font-bold uppercase tracking-wider text-sm ${statusConfig.text}`}>
                     {statusConfig.label}
                   </span>
                </div>
                
                <div className="p-6 md:p-8 flex flex-col lg:flex-row gap-6">
                  <div className="flex-1">
                    <div className="mb-4">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Request Details</p>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{quote.client.title || 'Unknown Request'}</h3>
                      <p className="text-gray-500 font-medium">Client: <span className="text-gray-900">{quote.client?.full_name || 'Unknown Client'}</span></p>
                    </div>

                    {quote.message && (
                      <div className="mb-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Your Message</p>
                        <p className="text-gray-700 italic">"{quote.message}"</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="lg:w-64 shrink-0 flex flex-col justify-between">
                    <div>
                      <div className="mb-4">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Quote Amount</p>
                        <p className="text-2xl font-black text-gray-900 flex items-center gap-1">
                          <IndianRupee size={20} /> {quote.amount}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Delivery Time</p>
                        <p className="text-lg font-bold text-gray-700">{quote.delivery_days} Days</p>
                      </div>
                    </div>

                    <div className="mt-6">
                      {quote.status === 'accepted' && (
                        <Link to="/dashboard/artist/orders" className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2">
                          <Eye size={18} /> View Order
                        </Link>
                      )}
                      {quote.status === 'pending' && (
                         <Link to={`/dashboard/artist/requests/${quote.portrait_request?.id}`} className="w-full px-6 py-3 bg-white text-indigo-600 border-2 border-indigo-100 hover:bg-indigo-50 font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                           View Request
                         </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
