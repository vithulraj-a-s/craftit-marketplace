import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../services/axiosInstance';
import { Loader } from '../../components/ui/Loader';
import { IndianRupee, Clock, CheckCircle, MessageCircle, AlertCircle, Package } from 'lucide-react';

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();

  const handleChatClick = (orderId) => {
    navigate(`/chat/${orderId}`);
  };

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/api/orders/${id}/`);
        setOrder(response.data);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Failed to load order details. It may not exist or you don't have access.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchOrder();
  }, [id]);

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'pending_payment':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Waiting for Payment' };
      case 'in_progress':
        return { bg: 'bg-indigo-100', text: 'text-indigo-800', label: 'In Progress' };
      case 'delivered':
        return { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Delivered' };
      case 'completed':
        return { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed' };
      case 'cancelled':
        return { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', label: status };
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader size={48} />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-100 text-center font-bold text-lg">
          {error || "Order not found."}
        </div>
      </div>
    );
  }

  const statusConfig = getStatusDisplay(order.status);

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-2">
            {order.request_title || 'Portrait Commission'}
          </h1>
          <p className="text-gray-500 font-medium">Order ID: #{order.id}</p>
        </div>
        <div className="shrink-0 flex items-center">
          <span className={`px-5 py-2.5 rounded-full text-sm font-bold uppercase tracking-wider inline-block ${statusConfig.bg} ${statusConfig.text}`}>
            {statusConfig.label}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Details Section */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
              <Package size={20} className="text-indigo-600" />
              Order Details
            </h2>
            
            <div className="space-y-6">
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Description</p>
                <div className="text-gray-700 bg-gray-50 p-6 rounded-xl border border-gray-100 leading-relaxed min-h-[100px]">
                  {order.request_description ? (
                    <p className="whitespace-pre-wrap">{order.request_description}</p>
                  ) : (
                    <p className="italic text-gray-400">No description provided for this portrait commission.</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-gray-50">
                <div>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Portrait Style</p>
                  <p className="text-lg font-bold text-gray-900 capitalize">
                    {order.portrait_style ? order.portrait_style.replace('_', ' ') : 'Any'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Price</p>
                  <p className="text-xl font-black text-indigo-600">₹{order.quote_amount}</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Delivery Time</p>
                  <p className="text-lg font-bold text-gray-900">
                    {order.delivery_days} {order.delivery_days === 1 ? 'day' : 'days'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Image Section */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">
              Final Portrait
            </h2>
            
            {order.final_image ? (
              <div className="rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 flex justify-center">
                <img 
                  src={order.final_image} 
                  alt="Final delivered portrait" 
                  className="max-h-[500px] w-auto object-contain hover:scale-[1.02] transition-transform duration-300"
                />
              </div>
            ) : (
              <div className="bg-gray-50 rounded-2xl p-12 text-center border border-gray-100 border-dashed flex flex-col items-center justify-center">
                <Clock size={32} className="text-gray-300 mb-4" />
                <p className="text-gray-500 font-medium text-lg italic">
                  Not delivered yet
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar / Timeline Section */}
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">
              Timeline
            </h2>
            
            <div className="space-y-8 pl-2">
              <div className="relative border-l-2 border-indigo-200 pl-6 pb-2">
                <div className="absolute w-4 h-4 bg-indigo-600 rounded-full -left-[9px] top-1 border-4 border-white shadow-sm"></div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Created At</p>
                <p className="text-gray-900 font-medium">{order.created_at ? new Date(order.created_at).toLocaleString() : 'N/A'}</p>
              </div>

              {order.completed_at && (
                <div className="relative border-l-2 border-transparent pl-6">
                  <div className="absolute w-4 h-4 bg-green-500 rounded-full -left-[9px] top-1 border-4 border-white shadow-sm"></div>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Completed At</p>
                  <p className="text-gray-900 font-medium">{new Date(order.completed_at).toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          {order.status?.toUpperCase() === 'IN_PROGRESS' && (
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">
                Actions
              </h2>
              <button 
                onClick={() => handleChatClick(order.id)}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95"
              >
                <MessageCircle size={20} />
                Chat with Artist
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
