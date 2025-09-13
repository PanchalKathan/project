import { useState, useEffect, useCallback, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import api from "../../apis/api";
import { FaUserEdit, FaBoxOpen, FaSpinner } from "react-icons/fa";

export default function ProfilePage() {
  const { user, login, isAuthLoading } = useAuth(); // Get auth loading state
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState(location.state?.initialTab || "profile");
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", street: "", city: "", state: "", postalCode: "",
  });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState({ profile: false, orders: true });

  // This effect handles redirection and form pre-filling safely
  useEffect(() => {
    // Only run this logic AFTER the initial auth check is complete
    if (!isAuthLoading) {
      if (!user) {
        toast.error("Please log in to view your profile.");
        navigate("/login");
      } else {
        // If the user is logged in, pre-fill the form
        setFormData({
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          street: user.address?.street || "",
          city: user.address?.city || "",
          state: user.address?.state || "",
          postalCode: user.address?.postalCode || "",
        });
      }
    }
  }, [user, isAuthLoading, navigate]);

  // Fetch user's order history only if the user exists
  useEffect(() => {
    const fetchOrders = async () => {
      if (user && !isAuthLoading) { // Only fetch if user is confirmed
        try {
          setLoading((prev) => ({ ...prev, orders: true }));
          const { data } = await api.get("/orders/myorders"); 
          setOrders(data);
        } catch (err) {
          toast.error("Could not fetch order history.");
        } finally {
          setLoading((prev) => ({ ...prev, orders: false }));
        }
      }
    };
    fetchOrders();
  }, [user, isAuthLoading]);

  const handleChange = useCallback((e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading((prev) => ({ ...prev, profile: true }));
    try {
      const updatedData = {
        name: formData.name,
        phone: formData.phone,
        address: {
          street: formData.street, city: formData.city,
          state: formData.state, postalCode: formData.postalCode,
        },
      };

      // --- CRITICAL FIX: Use the correct user ID property ---
      const userId = user._id || user.id;
      if (!userId) {
        toast.error("Could not find user ID.");
        return;
      }
      
      const { data: updatedUser } = await api.put(`/customers/profile/${userId}`, updatedData);
      const token = localStorage.getItem("token");
      login(updatedUser, token); // Update the global user state
      toast.success("Profile updated successfully!");

    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update profile.");
    } finally {
      setLoading((prev) => ({ ...prev, profile: false }));
    }
  };

  // Show a full-page loader while the auth state is being verified
  if (isAuthLoading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <FaSpinner className="animate-spin text-4xl text-indigo-500" />
      </div>
    );
  }

  // If after loading, there is still no user, render nothing as the redirect is in progress.
  if (!user) {
    return null;
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-8">My Account</h1>
        <div className="flex border-b mb-8">
          <TabButton icon={<FaUserEdit />} label="Profile Details" activeTab={activeTab} tabName="profile" onClick={setActiveTab} />
          <TabButton icon={<FaBoxOpen />} label="Order History" activeTab={activeTab} tabName="orders" onClick={setActiveTab} />
        </div>
        {activeTab === "profile" && <ProfileForm formData={formData} handleChange={handleChange} handleSubmit={handleProfileUpdate} loading={loading.profile} />}
        {activeTab === "orders" && <OrderHistory orders={orders} loading={loading.orders} />}
      </div>
    </div>
  );
}

// --- Sub-components (no changes needed below) ---

const TabButton = ({ icon, label, activeTab, tabName, onClick }) => (
  <button onClick={() => onClick(tabName)} className={`flex items-center gap-2 px-6 py-3 font-semibold transition-colors duration-200 ${activeTab === tabName ? "border-b-2 border-indigo-600 text-indigo-600" : "text-gray-500 hover:text-indigo-500"}`}>
    {icon} {label}
  </button>
);

const ProfileForm = ({ formData, handleChange, handleSubmit, loading }) => (
  <div className="bg-white p-8 rounded-xl shadow-lg animate-fade-in">
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField name="name" label="Full Name" value={formData.name} onChange={handleChange} />
        <InputField name="email" label="Email Address" value={formData.email} disabled />
      </div>
      <InputField name="phone" label="Phone Number" value={formData.phone} onChange={handleChange} />
      <h3 className="text-lg font-semibold text-gray-600 border-t pt-6">Shipping Address</h3>
      <InputField name="street" label="Street Address" value={formData.street} onChange={handleChange} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <InputField name="city" label="City" value={formData.city} onChange={handleChange} className="md:col-span-2" />
        <InputField name="postalCode" label="PIN Code" value={formData.postalCode} onChange={handleChange} />
      </div>
      <InputField name="state" label="State" value={formData.state} onChange={handleChange} />
      <div className="text-right">
        <button type="submit" disabled={loading} className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg shadow-md hover:bg-indigo-700 transition disabled:bg-gray-400">
          {loading ? <FaSpinner className="animate-spin" /> : "Save Changes"}
        </button>
      </div>
    </form>
  </div>
);

const InputField = ({ name, label, className, ...props }) => (
  <div className={className}>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input id={name} name={name} {...props} className="w-full p-3 border rounded-lg bg-gray-50 disabled:bg-gray-200" />
  </div>
);

const OrderHistory = ({ orders, loading }) => {
  if (loading) {
    return <div className="text-center py-10"><FaSpinner className="animate-spin text-4xl text-indigo-500 mx-auto" /></div>;
  }
  if (orders.length === 0) {
    return <div className="text-center py-10 bg-white rounded-lg shadow-md"><p className="text-gray-600">You haven't placed any orders yet.</p></div>;
  }
  return (
    <div className="space-y-4 animate-fade-in">
      {orders.map((order) => (
        <div key={order._id} className="bg-white p-6 rounded-lg shadow-md flex justify-between items-center">
          <div>
            <p className="font-bold text-gray-800">Order #{order._id.substring(0, 8)}...</p>
            <p className="text-sm text-gray-500">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
            <p className="text-sm text-gray-500">Total: <span className="font-medium">₹{order.totalAmount.toLocaleString("en-IN")}</span></p>
          </div>
          <span className={`px-3 py-1 text-sm font-semibold rounded-full ${order.status === "Delivered" ? "bg-green-100 text-green-800" : order.status === "Shipped" ? "bg-blue-100 text-blue-800" : "bg-yellow-100 text-yellow-800"}`}>
            {order.status}
          </span>
        </div>
      ))}
    </div>
  );
};

