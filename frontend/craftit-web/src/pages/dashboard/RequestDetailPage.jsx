import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getPortraitRequestDetail, updatePortraitRequestStatus } from '../../services/portraitRequestService';
import { updateQuoteStatus, createQuote } from '../../services/quoteService';
import axiosInstance from '../../services/axiosInstance';
import { Loader } from '../../components/ui/Loader';
import { useAuth } from '../../context/AuthContext';
import { Calendar, DollarSign, ArrowLeft, User, ImageIcon, Check, X } from 'lucide-react';
import QuoteCard from '../../components/client/QuoteCard';
import clsx from 'clsx';

export default function RequestDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [requestItem, setRequestItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [quotes, setQuotes] = useState([]);
  const [loadingQuotes, setLoadingQuotes] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [quoteForm, setQuoteForm] = useState({
    amount: '',
    delivery_days: '',
    message: ''
  });

  const isArtist = user?.role === 'ARTIST' || user?.role === 'artist';

  // useEffect(() => {
  //   const fetchDetail = async () => {
  //     try {
  //       const data = await getPortraitRequestDetail(id);
  //       setRequestItem(data);
        
  //       try {
  //         setLoadingQuotes(true);
  //         const quotesRes = await axiosInstance.get(`/api/quotes/?portrait_request=${id}`);
  //         setQuotes(quotesRes.data);
  //       } catch (quoteErr) {
  //         console.error("Failed to fetch quotes:", quoteErr);
  //       } finally {
  //         setLoadingQuotes(false);
  //       }
  //     } catch (err) {
  //       console.error(err);
  //       setError("Request not found or you do not have permission to view it.");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   fetchDetail();
  // }, [id]);

  // 1. Fetch request
  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const data = await getPortraitRequestDetail(id);
        setRequestItem(data);
      } catch (err) {
        console.error(err);
        setError("Request not found or you do not have permission to view it.");
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [id]);


  // 2. Fetch quotes (SEPARATE)
  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        setLoadingQuotes(true);
        const res = await axiosInstance.get(`/api/quotes/?portrait_request=${id}`);
        setQuotes(res.data);
      } catch (err) {
        console.error("Failed to fetch quotes:", err);
      } finally {
        setLoadingQuotes(false);
      }
    };

    fetchQuotes();
  }, [id]);

  const handleStatusUpdate = async (status) => {
    setActionLoading(true);
    try {
      await updatePortraitRequestStatus(id, status);
      setRequestItem(prev => ({ ...prev, status }));
    } catch (err) {
      console.error(`Failed to update status to ${status}`, err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleQuoteAction = async (quoteId, status) => {
    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      await axiosInstance.patch(`/api/quotes/${quoteId}/status/`, { status });
      
      if (status === 'accepted') {
        navigate('/dashboard/client/orders');
      } else {
        // Refetch quotes
        const quotesRes = await axiosInstance.get(`/api/quotes/?portrait_request=${id}`);
        setQuotes(quotesRes.data);
        
        // Also re-fetch detail to keep UI in sync
        const data = await getPortraitRequestDetail(id);
        setRequestItem(data);

        setActionSuccess("Quote rejected successfully");
        setTimeout(() => setActionSuccess(null), 3000);
      }
    } catch (err) {
      console.error(`Failed to update quote status to ${status}:`, err);
      setActionError("Failed to update quote. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleQuoteSubmit = async (e) => {
    e.preventDefault();
    if (!quoteForm.amount || !quoteForm.delivery_days) {
      alert("Amount and Delivery Days are required.");
      return;
    }
    setActionLoading(true);
    try {
      await createQuote({
        portrait_request: parseInt(id),
        amount: quoteForm.amount,
        delivery_days: parseInt(quoteForm.delivery_days),
        message: quoteForm.message
      });
      alert('Quote sent successfully!');
      setShowQuoteForm(false);
      setRequestItem(prev => ({ ...prev, status: 'quote_sent' }));
    } catch (err) {
      console.error("Failed to send quote", err);
      alert('Failed to send quote. Please confirm the request is still pending.');
    } finally {
      setActionLoading(false);
    }
  };

  const formatQuoteStatus = (status) => {
    switch(status) {
      case 'pending': return 'Pending';
      case 'accepted': return 'Accepted';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending':
        return <span className="px-4 py-1.5 bg-yellow-100 text-yellow-800 rounded-full text-sm font-bold uppercase tracking-wider">Pending Review</span>;
      case 'accepted':
        return <span className="px-4 py-1.5 bg-green-100 text-green-800 rounded-full text-sm font-bold uppercase tracking-wider">Accepted</span>;
      case 'rejected':
        return <span className="px-4 py-1.5 bg-red-100 text-red-800 rounded-full text-sm font-bold uppercase tracking-wider">Rejected</span>;
      default:
        return <span className="px-4 py-1.5 bg-gray-100 text-gray-800 rounded-full text-sm font-bold uppercase tracking-wider">{status}</span>;
    }
  };

  if (loading) return <div className="flex justify-center items-center h-[60vh]"><Loader size={48} /></div>;
  if (error || !requestItem) return (
    <div className="flex flex-col items-center justify-center h-[60vh]">
      <div className="p-8 text-center text-red-500 font-bold text-xl mb-4">{error}</div>
      <button onClick={() => navigate(-1)} className="text-indigo-600 font-bold hover:underline">Go Back</button>
    </div>
  );

  return (
    <div className="max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 font-semibold mb-6 transition-colors"
      >
        <ArrowLeft size={20} /> Back to Requests
      </button>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        
        <div className="border-b border-gray-100 p-8 sm:p-10 bg-gray-50/50 flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <h1 className="text-3xl font-extrabold text-gray-900">{requestItem.title}</h1>
              {getStatusBadge(requestItem.status)}
            </div>
            
            <div className="flex flex-wrap items-center gap-6 text-gray-600 font-medium">
              <div className="flex items-center gap-2">
                <User size={18} className="text-gray-400" />
                <span>
                  {isArtist 
                    ? <span className="text-gray-900 font-bold">Client:</span> 
                    : <span className="text-gray-900 font-bold">Artist:</span>} 
                  {' '} {isArtist ? (requestItem.client?.full_name || 'Anonymous') : (requestItem.artist?.display_name || 'Artist')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-gray-400" />
                <span>Requested on {new Date(requestItem.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {isArtist && (
            <div className="flex flex-col gap-3 min-w-[200px] shrink-0">
               {requestItem.status === 'pending' && (
                 <>
                   <button 
                      onClick={() => setShowQuoteForm(true)}
                      disabled={actionLoading}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors disabled:opacity-70"
                   >
                     <Check size={20} /> Send Quote
                   </button>
                   <button 
                      onClick={() => handleStatusUpdate('rejected')}
                      disabled={actionLoading}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-red-50 text-red-600 font-bold rounded-xl border-2 border-red-100 transition-colors disabled:opacity-70"
                   >
                     <X size={20} /> Reject Request
                   </button>
                 </>
               )}
               {requestItem.status === 'quote_sent' && (
                 <span className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-50 text-indigo-700 font-bold rounded-xl border border-indigo-200">
                   <Check size={20} /> Quote Sent
                 </span>
               )}
            </div>
          )}
        </div>

        <div className="p-8 sm:p-10 flex flex-col lg:flex-row gap-12">
          
          <div className="flex-1 space-y-10">
            {!isArtist && requestItem.quote && (
              <QuoteCard 
                quote={requestItem.quote} 
                actionLoading={actionLoading} 
                onAccept={() => handleQuoteAction(requestItem.quote.id, 'accepted')}
                onReject={() => handleQuoteAction(requestItem.quote.id, 'rejected')}
              />
            )}

            <div>
               <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Project Description</h3>
               <p className="text-gray-800 text-lg leading-relaxed whitespace-pre-wrap">
                 {requestItem.description}
               </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 p-6 bg-gray-50 rounded-2xl border border-gray-100">
               <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Portrait Style</h4>
                  <p className="text-gray-900 font-bold text-lg capitalize">{requestItem.portrait_style}</p>
               </div>
               <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Budget Setup</h4>
                  <p className="text-gray-900 font-bold text-lg flex items-center">
                    {requestItem.budget ? <>Rs {requestItem.budget}</> : 'Open / Unspecified'}
                  </p>
               </div>
               <div className="sm:col-span-2">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Expected Delivery</h4>
                  <p className="text-gray-900 font-bold text-lg">
                    {requestItem.expected_delivery_date 
                      ? new Date(requestItem.expected_delivery_date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                      : 'Flexible / Not Specified'}
                  </p>
               </div>
            </div>
          </div>

          <div className="w-full lg:w-[400px] shrink-0">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Reference Material</h3>
            
            {requestItem.reference_image ? (
              <div className="bg-gray-100 rounded-2xl p-2 border border-gray-200">
                <img 
                  src={requestItem.reference_image} 
                  alt="Reference" 
                  className="w-full h-auto object-contain rounded-xl"
                  style={{ maxHeight: '400px' }}
                />
              </div>
            ) : (
              <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl h-48 flex flex-col items-center justify-center text-gray-400">
                <ImageIcon size={48} className="mb-2 opacity-50" />
                <p className="font-medium text-sm">No reference image provided</p>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Quotes Section */}
      <div className="mt-8 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100 p-8 sm:p-10 bg-gray-50/50">
          <h2 className="text-2xl font-extrabold text-gray-900">Quotes</h2>
        </div>
        <div className="p-8 sm:p-10">
          {actionError && (
            <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex justify-between items-center text-sm font-bold">
              <span>{actionError}</span>
              <button onClick={() => setActionError(null)} className="text-red-400 hover:text-red-600"><X size={16} /></button>
            </div>
          )}
          {actionSuccess && (
            <div className="mb-6 bg-green-50 text-green-700 p-4 rounded-xl border border-green-200 flex justify-between items-center text-sm font-bold">
              <span>{actionSuccess}</span>
              <button onClick={() => setActionSuccess(null)} className="text-green-500 hover:text-green-700"><X size={16} /></button>
            </div>
          )}

          {loadingQuotes ? (
            <p className="text-gray-500 font-medium text-lg">Loading quotes...</p>
          ) : quotes.length === 0 ? (
            <p className="text-gray-500 font-medium text-lg">No quotes received yet.</p>
          ) : (
            <div className="space-y-6">
              {quotes.map(quote => (
                <div key={quote.id} className="p-6 rounded-2xl border border-gray-200 bg-white hover:border-indigo-100 transition-colors shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <p className="text-2xl font-black text-indigo-600">
                        ₹{quote.amount}
                      </p>
                      <span className="text-gray-300">|</span>
                      <p className="text-gray-600 font-medium">
                        Delivery: <span className="font-bold text-gray-900">{quote.delivery_days} days</span>
                      </p>
                    </div>
                    {quote.message && (
                      <p className="text-gray-700 bg-gray-50 p-4 rounded-xl text-sm leading-relaxed border border-gray-100">
                        {quote.message}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-start md:items-end gap-3 min-w-[200px] shrink-0">
                    {(!isArtist && quote.status === 'pending') ? (
                      <div className="flex gap-3 w-full">
                        <button 
                          onClick={() => handleQuoteAction(quote.id, "accepted")}
                          disabled={actionLoading}
                          className="flex-1 py-3 px-5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-indigo-200 flex justify-center items-center gap-2"
                        >
                          {actionLoading ? "Processing..." : <><Check size={16} /> Accept</>}
                        </button>
                        <button 
                          onClick={() => handleQuoteAction(quote.id, "rejected")}
                          disabled={actionLoading}
                          className="flex-1 py-3 px-5 bg-white hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed text-red-600 border-2 border-red-100 rounded-xl font-bold text-sm transition-all flex justify-center items-center gap-2"
                        >
                          {actionLoading ? "Processing..." : <><X size={16} /> Reject</>}
                        </button>
                      </div>
                    ) : (
                      <span className={clsx(
                        "px-5 py-2 rounded-full text-sm font-bold uppercase tracking-wider text-center w-full md:w-auto",
                        quote.status === 'pending' ? "bg-yellow-100 text-yellow-800" :
                        quote.status === 'accepted' ? "bg-green-100 text-green-800" :
                        "bg-red-100 text-red-800"
                      )}>
                        {formatQuoteStatus(quote.status)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showQuoteForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-900">Send Quote</h2>
              <button onClick={() => setShowQuoteForm(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleQuoteSubmit} className="p-6">
              <div className="space-y-5">
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1.5">Quote Amount (Rs) *</label>
                  <input 
                    type="number" 
                    min="0"
                    step="0.01"
                    required
                    value={quoteForm.amount}
                    onChange={(e) => setQuoteForm({...quoteForm, amount: e.target.value})}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="e.g. 1200"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1.5">Estimated Delivery Days *</label>
                  <input 
                    type="number" 
                    min="1"
                    required
                    value={quoteForm.delivery_days}
                    onChange={(e) => setQuoteForm({...quoteForm, delivery_days: e.target.value})}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="e.g. 7"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1.5">Message to Client (Optional)</label>
                  <textarea 
                    rows={4}
                    value={quoteForm.message}
                    onChange={(e) => setQuoteForm({...quoteForm, message: e.target.value})}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                    placeholder="I can complete this in watercolor style..."
                  />
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-100 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowQuoteForm(false)}
                  disabled={actionLoading}
                  className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={actionLoading}
                  className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {actionLoading ? 'Sending...' : 'Send Quote'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
