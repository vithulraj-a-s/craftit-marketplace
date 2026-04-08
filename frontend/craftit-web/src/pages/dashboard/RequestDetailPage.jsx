import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getPortraitRequestDetail, updatePortraitRequestStatus } from '../../services/portraitRequestService';
import { Loader } from '../../components/ui/Loader';
import { useAuth } from '../../context/AuthContext';
import { Calendar, DollarSign, ArrowLeft, User, ImageIcon, Check, X } from 'lucide-react';
import clsx from 'clsx';

export default function RequestDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [requestItem, setRequestItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const isArtist = user?.role === 'ARTIST' || user?.role === 'artist';

  useEffect(() => {
    const fetchDetail = async () => {
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
    fetchDetail();
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
                  {' '} {isArtist ? (requestItem.client?.display_name || 'Anonymous') : (requestItem.artist?.display_name || 'Artist')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-gray-400" />
                <span>Requested on {new Date(requestItem.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {isArtist && requestItem.status === 'pending' && (
            <div className="flex flex-col gap-3 min-w-[200px] shrink-0">
               <button 
                  onClick={() => handleStatusUpdate('accepted')}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors disabled:opacity-70"
               >
                 <Check size={20} /> Accept Request
               </button>
               <button 
                  onClick={() => handleStatusUpdate('rejected')}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-red-50 text-red-600 font-bold rounded-xl border-2 border-red-100 transition-colors disabled:opacity-70"
               >
                 <X size={20} /> Decline
               </button>
            </div>
          )}
        </div>

        <div className="p-8 sm:p-10 flex flex-col lg:flex-row gap-12">
          
          <div className="flex-1 space-y-10">
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
    </div>
  );
}
