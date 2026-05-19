import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../services/axiosInstance';
import { Loader } from '../../components/ui/Loader';
import { IndianRupee, Clock, CheckCircle, MessageCircle, AlertCircle, Package, Star } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { updateOrderStatus } from '../../services/orderService';
import { createReview, updateReview, getOrderReview } from '../../services/reviewService';

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  // Review states
  const [existingReview, setExistingReview] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [isEditingReview, setIsEditingReview] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, review: '' });
  const [completionLoading, setCompletionLoading] = useState(false);

  const handleChatClick = (orderId) => {
    navigate(`/chat/${orderId}`);
  };

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;
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

    fetchOrder();
  }, [id]);

  useEffect(() => {
    const fetchReview = async () => {
      if (!order || order.status !== 'completed' || user?.role !== 'CLIENT') return;

      try {
        setReviewLoading(true);
        const review = await getOrderReview(order.id);
        
        if (review) {
          setExistingReview(review);
          setReviewForm({ rating: review.rating, review: review.review });
        }
      } catch (err) {
        if (err.response && err.response.status === 404) {
          // Review does not exist yet
          setExistingReview(null);
        } else {
          console.error("Failed to fetch order review", err);
        }
      } finally {
        setReviewLoading(false);
      }
    };

    fetchReview();
  }, [order?.status, order?.id, user?.role]);

  const handleMarkCompleted = async () => {
    if (!order) return;
    try {
      setCompletionLoading(true);
      const updated = await updateOrderStatus(order.id, {status: 'completed'});
      setOrder(prev => ({ 
        ...prev, 
        status: 'completed', 
        completed_at: updated.completed_at || new Date().toISOString() 
      }));
    } catch (err) {
      console.error(err);
      alert("Failed to mark order as completed.");
    } finally {
      setCompletionLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!order) return;
    try {
      setReviewLoading(true);
      if (existingReview && isEditingReview) {
        const updated = await updateReview(existingReview.id, {
          rating: reviewForm.rating,
          review: reviewForm.review
        });
        setExistingReview({ ...existingReview, ...updated });
        setIsEditingReview(false);
      } else {
        const created = await createReview({
          order_id: order.id,
          rating: reviewForm.rating,
          review: reviewForm.review
        });
        setExistingReview(created);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save review.");
    } finally {
      setReviewLoading(false);
    }
  };

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
        return { bg: 'bg-gray-100', text: 'text-gray-800', label: status || 'Unknown' };
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
  const isClient = user?.role === 'CLIENT';

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

          {/* Actions Section */}
          {(order.status === 'in_progress' || (order.status === 'delivered' && isClient)) && (
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">
                Actions
              </h2>
              <div className="space-y-4">
                {(order.status === 'in_progress' || order.status === 'delivered') && (
                  <button 
                    onClick={() => handleChatClick(order.id)}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95"
                  >
                    <MessageCircle size={20} />
                    Chat with Artist
                  </button>
                )}

                {order.status === 'delivered' && isClient && (
                  <button 
                    onClick={handleMarkCompleted}
                    disabled={completionLoading}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-green-200 transition-all active:scale-95 disabled:opacity-70"
                  >
                    {completionLoading ? <Loader size={20} color="white" /> : <CheckCircle size={20} />}
                    Mark as Completed
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Review Section */}
          {order.status === 'completed' && isClient && (
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4 flex items-center gap-2">
                <Star size={20} className="text-yellow-500" />
                Artist Review
              </h2>

              {reviewLoading && !existingReview ? (
                <div className="flex justify-center py-4"><Loader size={24} /></div>
              ) : existingReview && !isEditingReview ? (
                <div className="space-y-4">
                  <div className="flex gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} size={18} className={star <= existingReview.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"} />
                    ))}
                  </div>
                  <p className="text-gray-700 text-sm leading-relaxed">{existingReview.review}</p>
                  <p className="text-xs text-gray-400 mt-2 font-medium">
                    Posted on {new Date(existingReview.created_at).toLocaleDateString()}
                  </p>
                  <button 
                    onClick={() => setIsEditingReview(true)}
                    className="mt-4 w-full px-4 py-3 bg-white border border-gray-200 text-indigo-600 hover:bg-indigo-50 font-bold rounded-xl transition-colors"
                  >
                    Edit Review
                  </button>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                          className="focus:outline-none hover:scale-110 transition-transform"
                        >
                          <Star size={28} className={star <= reviewForm.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Your Review</label>
                    <textarea
                      required
                      value={reviewForm.review}
                      onChange={(e) => setReviewForm({ ...reviewForm, review: e.target.value })}
                      placeholder="Share your experience working with this artist..."
                      className="w-full rounded-xl border border-gray-200 p-4 text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none min-h-[100px]"
                    />
                  </div>
                  <div className="flex gap-3">
                    {isEditingReview && (
                      <button 
                        type="button"
                        onClick={() => {
                          setIsEditingReview(false);
                          setReviewForm({ rating: existingReview.rating, review: existingReview.review });
                        }}
                        className="flex-1 px-4 py-3 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold rounded-xl transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                    <button 
                      type="submit"
                      disabled={reviewLoading}
                      className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all active:scale-95 disabled:opacity-70 flex justify-center items-center"
                    >
                      {reviewLoading ? <Loader size={20} color="white" /> : (existingReview ? 'Update Review' : 'Submit Review')}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
