import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../apis/api"; // Use the secure API client
import { FaSpinner, FaCheckCircle } from "react-icons/fa";

export default function SuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);
  const sessionId = query.get("session_id");

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Clear the cart from localStorage after a successful purchase
    localStorage.removeItem("cart");
    // Dispatch a custom event so the header updates its cart count immediately
    window.dispatchEvent(new Event("cartUpdated"));
    
    if (!sessionId) {
      setLoading(false);
      return;
    }
    
    // Use the secure 'api' client which automatically sends the auth token
    api
      .get(`/payment/session/${sessionId}`)
      .then((res) => setOrder(res.data))
      .catch((err) => console.error("Failed to fetch session details:", err))
      .finally(() => setLoading(false));
  }, [sessionId]);

  // Show a full-page loader while fetching data
  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
      </div>
    );
  }

  // Handle cases where the order is not found or the session is invalid
  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center p-4">
        <h1 className="text-2xl font-bold mb-4">⚠️ Order Details Not Found</h1>
        <p className="text-gray-600 mb-6 max-w-md">The payment session may have expired or is invalid. Please check your profile for your order history.</p>
        <button
          onClick={() => navigate("/")}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold"
        >
          Go Back to Home
        </button>
      </div>
    );
  }

  // Safely parse the 'shippingAddress' from metadata
  const shippingAddressString = order.metadata.shippingAddress;
  const address = shippingAddressString ? JSON.parse(shippingAddressString) : null;
  
  const customerDetails = order.customer_details;
  const items = order.line_items?.data || [];

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Payment Successful!
          </h1>
          <p className="text-gray-600 mb-8">
            Thank you, <strong>{customerDetails.name}</strong>. Your order is confirmed.
          </p>

          <div className="text-left bg-gray-50 p-6 rounded-lg">
             <h2 className="text-xl font-bold mb-4 text-gray-800">Order Summary</h2>
             
             {/* Purchased Items */}
             <ul className="divide-y divide-gray-200 mb-4">
               {items.map((item) => (
                 <li key={item.id} className="flex justify-between items-center py-3">
                   <div>
                     <p className="font-semibold text-gray-700">{item.description}</p>
                     <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                   </div>
                   <span className="font-semibold text-gray-800">₹{(item.amount_total / 100).toFixed(2)}</span>
                 </li>
               ))}
             </ul>

             {/* Total */}
             <div className="flex justify-between font-bold text-lg border-t pt-4 text-gray-900">
                <span>Total Paid</span>
                <span>₹{(order.amount_total / 100).toFixed(2)}</span>
             </div>
          </div>
          
          {/* Shipping Address */}
          {address && (
            <div className="text-left bg-gray-50 p-6 rounded-lg mt-6">
                <h3 className="text-xl font-bold mb-2 text-gray-800">Shipping To</h3>
                <address className="text-gray-600 not-italic">
                    {address.street}, <br />
                    {address.city}, {address.state} - {address.postalCode}
                </address>
            </div>
          )}

          <button
            onClick={() => navigate("/")}
            className="mt-8 w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold text-lg transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}