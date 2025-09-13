import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { AuthContext } from '../../context/AuthContext';
import api from "../../apis/api"; // Using your central api instance
import { toast } from "react-toastify";
import { FaLock, FaCreditCard, FaSpinner } from "react-icons/fa";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default function PaymentPage() {
  const { user, login } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const { cartItems } = location.state || { cartItems: [] };

  const [formData, setFormData] = useState({
    fullName: "", email: "", address: "", city: "", zip: "", state: ""
  });
  const [loading, setLoading] = useState(false);

  // --- Calculations for Display ---
  // The frontend calculates these for UI purposes. The backend will re-verify.
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const deliveryFee = subtotal > 500 ? 0 : 50;
  const tax = subtotal * 0.18;
  const totalAmount = subtotal + deliveryFee + tax;
  // ---

  useEffect(() => {
    if (!user) {
      toast.error("Please log in to proceed with your order.");
      navigate("/login");
    } else {
      setFormData({
        fullName: user.name || "",
        email: user.email || "",
        address: user.address?.street || "",
        city: user.address?.city || "",
        zip: user.address?.postalCode || "",
        state: user.address?.state || ""
      });
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleStripeCheckout = async () => {
    if (!formData.fullName || !formData.email || !formData.address || !formData.city || !formData.zip || !formData.state) {
      toast.error("Please fill in all required shipping fields!");
      return;
    }

    setLoading(true);
    try {
        const updatedAddress = {
            street: formData.address, city: formData.city,
            state: formData.state, postalCode: formData.zip,
        };
        
        // Update user's address before payment
        const { data: updatedUser } = await api.put(`/customers/profile/${user._id}`, { address: updatedAddress });
        
        const token = localStorage.getItem('token');
        login(updatedUser, token); // Update global state
        
        // --- SECURE PAYMENT PAYLOAD ---
        // Send the individual components to the backend for verification.
        const { data } = await api.post(
            `/payment/create-checkout-session`,
            { 
              cartItems, 
              customerId: user._id,
              // Sending these components allows the server to verify the total
              subtotal,
              deliveryFee,
              tax
            }
        );

        const stripe = await stripePromise;
        const result = await stripe.redirectToCheckout({ sessionId: data.sessionId });
        if (result.error) {
           toast.error(result.error.message);
        }

    } catch (err) {
        console.error("Checkout process error:", err);
        toast.error(err.response?.data?.error || "Could not start the payment process.");
    } finally {
        setLoading(false);
    }
  };

  if (!user) {
    return <div className="text-center py-20 font-semibold">Authenticating...</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight flex items-center justify-center gap-3">
            <FaLock className="text-gray-400" /> Secure Checkout
          </h1>
          <p className="text-lg text-gray-500 mt-2">Complete your purchase with confidence.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="bg-white p-8 rounded-xl shadow-lg lg:sticky lg:top-24">
            <h2 className="text-2xl font-bold mb-6 text-gray-700">Order Summary</h2>
            <div className="space-y-4 max-h-64 overflow-y-auto pr-2 mb-6">
              {cartItems.map((item) => (
                <div key={item._id} className="flex items-center justify-between text-gray-600">
                  <div className="flex items-center gap-4">
                    <img src={item.image} alt={item.name} className="w-16 h-16 rounded-md object-cover"/>
                    <div>
                      <p className="font-semibold text-gray-800">{item.name}</p>
                      <p className="text-sm">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-medium">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-6 space-y-3 text-gray-600">
                <div className="flex justify-between"><span>Subtotal</span><span className="font-medium">₹{subtotal.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between"><span>Delivery Fee</span><span className="font-medium">{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toLocaleString('en-IN')}`}</span></div>
                <div className="flex justify-between"><span>Taxes (GST 18%)</span><span className="font-medium">₹{tax.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                <div className="flex justify-between font-bold text-xl text-gray-800 border-t pt-4 mt-4">
                    <span>Grand Total</span>
                    <span>₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
            </div>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-gray-700">Shipping Information</h2>
            <form className="space-y-4">
              <input type="text" name="fullName" placeholder="Full Name" value={formData.fullName} onChange={handleChange} className="w-full p-3 border rounded-lg bg-gray-50" />
              <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} className="w-full p-3 border rounded-lg bg-gray-50" />
              <input type="text" name="address" placeholder="Street Address" value={formData.address} onChange={handleChange} className="w-full p-3 border rounded-lg bg-gray-50" />
              <div className="grid grid-cols-3 gap-4">
                <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleChange} className="w-full p-3 border rounded-lg bg-gray-50 col-span-2" />
                <input type="text" name="zip" placeholder="PIN Code" value={formData.zip} onChange={handleChange} className="w-full p-3 border rounded-lg bg-gray-50" />
              </div>
               <input type="text" name="state" placeholder="State" value={formData.state} onChange={handleChange} className="w-full p-3 border rounded-lg bg-gray-50" />
            </form>
            <div className="mt-8">
              <button
                onClick={handleStripeCheckout}
                disabled={loading}
                className={`w-full text-white font-bold py-4 rounded-lg transition-transform transform hover:scale-105 flex items-center justify-center gap-3 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}
              >
                {loading ? <FaSpinner className="animate-spin" /> : (<><FaCreditCard /> Pay Securely</>)}
              </button>
              <p className="text-xs text-gray-500 text-center mt-3">You will be redirected to Stripe's secure payment gateway.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}