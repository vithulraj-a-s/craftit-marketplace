import React, { useEffect, useState, useRef } from 'react';
import { getArtistOrders, updateOrderStatus } from '../../services/orderService';
import { Loader } from '../../components/ui/Loader';
import { Package, IndianRupee, Image as ImageIcon, CheckCircle, AlertCircle, UploadCloud } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ArtistOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [uploadFiles, setUploadFiles] = useState({});
  const fileInputRefs = useRef({});

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getArtistOrders();
      setOrders(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load your orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    
    const handleFocus = () => {
      fetchOrders();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const handleFileChange = (orderId, e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadFiles(prev => ({ ...prev, [orderId]: file }));
    }
  };

  const handleDeliver = async (orderId) => {
    const file = uploadFiles[orderId];
    if (!file) return;

    setActionLoadingId(orderId);
    try {
      const formData = new FormData();
      formData.append('status', 'delivered');
      formData.append('final_image', file);
      
      await updateOrderStatus(orderId, formData);
      alert('Order marked as delivered!');
      setUploadFiles(prev => {
        const newFiles = { ...prev };
        delete newFiles[orderId];
        return newFiles;
      });
      await fetchOrders();
    } catch (err) {
      console.error(err);
      alert('Failed to update order status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'pending_payment':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-800',
          icon: <IndianRupee size={20} className="text-yellow-600" />,
          label: 'Waiting for Payment'
        };
      case 'in_progress':
        return {
          bg: 'bg-indigo-50',
          border: 'border-indigo-200',
          text: 'text-indigo-800',
          icon: <ImageIcon size={20} className="text-indigo-600" />,
          label: 'In Progress'
        };
      case 'delivered':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-800',
          icon: <Package size={20} className="text-blue-600" />,
          label: 'Delivered'
        };
      case 'completed':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-800',
          icon: <CheckCircle size={20} className="text-green-600" />,
          label: 'Completed'
        };
      case 'cancelled':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-800',
          icon: <AlertCircle size={20} className="text-red-600" />,
          label: 'Cancelled'
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-800',
          icon: <Package size={20} className="text-gray-600" />,
          label: status
        };
    }
  };

  if (loading && orders.length === 0) return <div className="flex justify-center items-center h-[60vh]"><Loader size={48} /></div>;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">My Orders</h1>
        <p className="text-gray-600 text-lg">Manage your portrait commissions and deliverables.</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 mb-8 font-bold">
          {error}
        </div>
      )}

      {orders.length === 0 && !error && !loading ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center shadow-sm">
          <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package size={40} className="text-gray-300" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">No Orders Yet</h2>
          <p className="text-gray-500 max-w-md mx-auto mb-8 text-lg">
            When clients accept your quotes and make a payment, your active orders will appear here.
          </p>
          <Link to="/dashboard/artist/requests" className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors inline-block">
            View Requests
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {orders.map((order) => {
            const statusConfig = getStatusDisplay(order.status);
            const uploadedFile = uploadFiles[order.id];

            return (
              <div key={order.id} className="bg-white border text-left border-gray-200 rounded-3xl shadow-sm overflow-hidden flex flex-col md:flex-row transition-all hover:shadow-md">
                <div className={`p-6 md:w-64 flex flex-col justify-center items-center text-center border-b md:border-b-0 md:border-r border-gray-100 ${statusConfig.bg}`}>
                   <div className="bg-white p-3 rounded-full mb-3 shadow-sm">
                     {statusConfig.icon}
                   </div>
                   <span className={`font-bold uppercase tracking-wider text-sm ${statusConfig.text}`}>
                     {statusConfig.label}
                   </span>
                </div>
                
                <div className="p-6 md:p-8 flex-1 flex flex-col">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{order.request_title || 'Portrait Commission'}</h3>
                      <p className="text-gray-500 font-medium">Client: <span className="text-gray-900">{order.other_user_name || 'Unknown'}</span></p>
                    </div>
                    <div className="text-left sm:text-right shrink-0">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Amount</p>
                      <p className="text-2xl font-black text-gray-900">₹{order.quote_amount}</p>
                    </div>
                  </div>
                  
                  {order.status === 'in_progress' && (
                    <div className="mt-6 mb-2 p-6 bg-gray-50 rounded-2xl border border-gray-200 border-dashed">
                      <h4 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                        <UploadCloud size={18} /> Upload Final Portrait
                      </h4>
                      <input 
                        type="file" 
                        accept="image/*"
                        className="hidden" 
                        ref={el => fileInputRefs.current[order.id] = el}
                        onChange={(e) => handleFileChange(order.id, e)}
                      />
                      
                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        <button
                          onClick={() => fileInputRefs.current[order.id]?.click()}
                          className="w-full sm:w-auto px-6 py-3 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                        >
                          <ImageIcon size={18} /> {uploadedFile ? 'Change File' : 'Choose File'}
                        </button>
                        
                        {uploadedFile && (
                          <span className="text-sm text-gray-600 font-medium truncate max-w-[200px]">
                            {uploadedFile.name}
                          </span>
                        )}

                        <button
                          onClick={() => handleDeliver(order.id)}
                          disabled={!uploadedFile || actionLoadingId === order.id}
                          className="w-full sm:w-auto sm:ml-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
                        >
                          {actionLoadingId === order.id ? <Loader size={18} color="white" /> : <Package size={18} />}
                          Mark as Delivered
                        </button>
                      </div>
                    </div>
                  )}

                  {((order.status === 'delivered' || order.status === 'completed') && order.final_image) && (
                    <div className="mt-4 mb-2">
                       <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Final Image Delivered</p>
                       <img src={order.final_image} alt="Delivered Portrait" className="h-32 w-auto object-cover rounded-lg border border-gray-200" />
                    </div>
                  )}
                  
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto pt-6 border-t border-gray-100">
                    <p className="text-gray-400 text-sm font-medium">
                      Order created on {new Date(order.created_at).toLocaleDateString()}
                    </p>
                    
                    <div className="flex flex-wrap items-center justify-end gap-3 w-full sm:w-auto">
                      <Link to={`/dashboard/orders/${order.id}`} className="w-full sm:w-auto px-6 py-2.5 bg-white border border-gray-200 text-indigo-600 hover:bg-indigo-50 font-bold rounded-xl transition-colors text-center inline-block">
                        View Details
                      </Link>
                      {order.status === 'in_progress' && (
                        <Link to={`/dashboard/chat/${order.id}`} className="w-full sm:w-auto px-6 py-2.5 bg-white text-indigo-600 hover:bg-indigo-50 font-bold rounded-xl border-2 border-indigo-100 transition-colors text-center inline-block">
                          Chat
                        </Link>
                      )}
                      {(order.status === 'completed' || order.status === 'delivered') && (
                        <span className="w-full sm:w-auto px-6 py-2.5 bg-gray-100 text-gray-500 font-bold rounded-xl cursor-not-allowed text-center inline-block">
                          Completed
                        </span>
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
