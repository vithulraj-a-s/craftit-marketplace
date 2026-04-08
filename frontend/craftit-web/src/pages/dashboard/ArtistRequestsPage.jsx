import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getArtistPortraitRequests, updatePortraitRequestStatus } from '../../services/portraitRequestService';
import { Loader } from '../../components/ui/Loader';
import { Calendar, DollarSign, ArrowRight, User, Check, X } from 'lucide-react';
import clsx from 'clsx';

export default function ArtistRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null); // stores ID of the request being updated

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await getArtistPortraitRequests();
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

  const handleStatusUpdate = async (id, status) => {
    setActionLoading(id);
    try {
      await updatePortraitRequestStatus(id, status);
      setRequests(prev => prev.map(req => req.id === id ? { ...req, status } : req));
    } catch (err) {
      console.error(`Failed to update status to ${status}`, err);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold uppercase tracking-wider">Pending</span>;
      case 'accepted':
        return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold uppercase tracking-wider">Accepted</span>;
      case 'rejected':
        return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold uppercase tracking-wider">Rejected</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-bold uppercase tracking-wider">{status}</span>;
    }
  };

  if (loading) return <div className="flex justify-center items-center h-[60vh]"><Loader size={40} /></div>;
  if (error) return <div className="p-8 text-center text-red-500 font-bold">{error}</div>;

  return (
    <div className="max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Commission Requests</h1>
          <p className="text-sm text-gray-500">Manage incoming project requests from clients.</p>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 border-dashed p-12 flex flex-col items-center justify-center text-center">
          <div className="bg-gray-50 p-4 rounded-full mb-4">
            <User size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No commission requests yet.</h3>
          <p className="text-gray-500 max-w-sm mb-6">When a client requests a custom portrait, it will appear here.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {requests.map(req => (
            <div key={req.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col sm:flex-row sm:items-center gap-6 hover:border-indigo-200 transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold text-lg text-gray-900">{req.title}</h3>
                  {getStatusBadge(req.status)}
                </div>
                <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-gray-600 font-medium">
                  <div><span className="text-gray-400">Client:</span> {req.client?.display_name || 'Anonymous Client'}</div>
                  <div className="capitalize"><span className="text-gray-400">Style:</span> {req.portrait_style}</div>
                  <div className="flex items-center gap-1">Rs {req.budget ? req.budget : 'Open'}</div>
                  <div className="flex items-center gap-1"><Calendar size={14} className="text-gray-400"/> {new Date(req.created_at).toLocaleDateString()}</div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-center items-center gap-2 shrink-0">
                {req.status === 'pending' && (
                  <div className="flex gap-2 w-full sm:w-auto mb-3 sm:mb-0">
                    <button 
                      onClick={() => handleStatusUpdate(req.id, 'accepted')}
                      disabled={actionLoading === req.id}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-4 py-2.5 bg-green-50 hover:bg-green-100 text-green-700 font-bold text-sm rounded-xl transition-colors border border-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Check size={16} /> Accept
                    </button>
                    <button 
                      onClick={() => handleStatusUpdate(req.id, 'rejected')}
                      disabled={actionLoading === req.id}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-sm rounded-xl transition-colors border border-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <X size={16} /> Reject
                    </button>
                  </div>
                )}
                
                <Link 
                  to={`/dashboard/artist/requests/${req.id}`}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-900 font-bold text-sm rounded-xl transition-colors border border-gray-200"
                >
                  View Details <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
