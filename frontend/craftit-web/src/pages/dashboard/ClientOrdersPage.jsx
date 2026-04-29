import React, { useEffect, useState } from 'react';
import { getClientOrders } from '../../services/orderService';
import { createPayment, verifyPayment } from '../../services/paymentService';
import { Loader } from '../../components/ui/Loader';
import { Package, IndianRupee, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ClientOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentLoadingId, setPaymentLoadingId] = useState(null);

  const fetchOrders = async () => {
  try {
    setLoading(true);
    const data = await getClientOrders();
    setOrders(data);
    setError(null);
  } catch (err) {
    console.error(err);
    setError("Failed to load orders.");
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
    fetchOrders();
  }, []);

// 🔥 move handler out to stabilize reference
const handlePaymentSuccess = async (paymentResponse) => {
  try {
    await verifyPayment(paymentResponse);
    alert("Payment successful!");

    // 🔥 call fetch AFTER a micro delay (prevents render cascade issues)
    setTimeout(() => {
      fetchOrders();
    }, 0);

  } catch (err) {
    console.error("Verification failed", err);
    alert("Payment verification failed. Please contact support.");
  }
};

const handlePayNow = async (orderId) => {
  setPaymentLoadingId(orderId);

  try {
    const paymentData = await createPayment(orderId);

    const options = {
      key: paymentData.key,
      amount: paymentData.amount,
      currency: paymentData.currency,
      order_id: paymentData.razorpay_order_id,
      name: "Craftit",
      description: "Portrait Commission Payment",
      handler: handlePaymentSuccess, // 🔥 stable reference
      prefill: {
        name: "",
        email: "",
        contact: ""
      },
      theme: {
        color: "#4f46e5"
      },
      modal: {
        ondismiss: function () {
          setPaymentLoadingId(null);
        }
      }
    };

    const rzp = new window.Razorpay(options);

    rzp.on("payment.failed", function (response) {
      alert(`Payment Failed: ${response.error.description}`);
      setPaymentLoadingId(null);
    });

    rzp.open();

  } catch (err) {
    console.error(err);
    alert("Failed to initiate payment. Please try again.");
    setPaymentLoadingId(null);
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
          icon: <Clock size={20} className="text-indigo-600" />,
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

  if (loading) return <div className="flex justify-center items-center h-[60vh]"><Loader size={48} /></div>;

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">My Orders</h1>
        <p className="text-gray-600 text-lg">Manage your portrait commissions and payments.</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 mb-8 font-bold">
          {error}
        </div>
      )}

      {orders.length === 0 && !error ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-16 text-center shadow-sm">
          <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package size={40} className="text-gray-300" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">No Orders Yet</h2>
          <p className="text-gray-500 max-w-md mx-auto mb-8 text-lg">
            When you accept a quote from an artist, your orders will appear here.
          </p>
          <Link to="/dashboard/client/requests" className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors inline-block">
            View Requests
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {orders.map((order) => {
            const statusConfig = getStatusDisplay(order.status);
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
                
                <div className="p-6 md:p-8 flex-1 flex flex-col justify-center">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{order.request_title || 'Portrait Commission'}</h3>
                      <p className="text-gray-500 font-medium">Artist: <span className="text-gray-900">{order.other_user_name || 'Unknown Artist'}</span></p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Amount</p>
                      <p className="text-2xl font-black text-gray-900">₹{order.quote_amount}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto pt-4 border-t border-gray-100">
                    <p className="text-gray-400 text-sm font-medium">
                      Order created on {new Date(order.created_at).toLocaleDateString()}
                    </p>
                    
                    <div className="flex flex-wrap items-center justify-end gap-3 w-full sm:w-auto">
                      <Link to={`/dashboard/orders/${order.id}`} className="w-full sm:w-auto px-6 py-3 bg-white border border-gray-200 text-indigo-600 hover:bg-indigo-50 font-bold rounded-xl transition-colors text-center inline-block">
                        View Details
                      </Link>
                      {order.status === 'pending_payment' && (
                        <button
                          onClick={() => handlePayNow(order.id)}
                          disabled={paymentLoadingId === order.id}
                          className="w-full sm:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
                        >
                          {paymentLoadingId === order.id ? <Loader size={20} color="white" /> : <IndianRupee size={18} />} 
                          Pay Now
                        </button>
                      )}
                      {order.status === 'in_progress' && (
                         <Link to={`/dashboard/chat/${order.id}`} className="w-full sm:w-auto px-6 py-3 bg-white text-indigo-600 hover:bg-indigo-50 font-bold rounded-xl border-2 border-indigo-100 transition-colors text-center inline-block">
                           Chat
                         </Link>
                      )}
                      {(order.status === 'completed' || order.status === 'delivered') && (
                        <span className="w-full sm:w-auto px-6 py-3 bg-gray-100 text-gray-500 font-bold rounded-xl cursor-not-allowed text-center inline-block">
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
