import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom"; // Import useLocation
import api from "../../apis/api";
import { toast } from "react-toastify";
import { FaSpinner } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext"; // Import useAuth to call login

// Reusable input component
const Input = ({ name, type, placeholder, value, onChange, required = true }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{placeholder}</label>
    <input
      name={name}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500"
    />
  </div>
);

export default function AuthPage() {
  const location = useLocation(); // Get location object
  const { login } = useAuth(); // Get login function from context
  
  // FIX: Initialize state based on navigation state from the Header
  const [isLoginMode, setIsLoginMode] = useState(!location.state?.isSignUp);
  
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", phone: "",
    street: "", city: "", state: "", postalCode: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    if (isLoginMode) {
      // Handle Login
      try {
        const { email, password } = formData;
        const res = await api.post("/user/login", { email, password });
        console.log(res)
        login(res.data.user, res.data.token); // Use context to manage login state
        toast.success(res.data.message);
        navigate("/profile");
      } catch (err) {
        toast.error(err.response?.data?.error || "Login failed.");
      }
    } else {
      // Handle Signup
      try {
        const payload = {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            phone: formData.phone,
            address: {
                street: formData.street,
                city: formData.city,
                state: formData.state,
                postalCode: formData.postalCode
            }
        };
        const res = await api.post("/user/signup", payload);
        login(res.data.customer, res.data.token,true); // Use context to log in after signup
        toast.success(res.data.message);
        navigate("/profile");
      } catch (err) {
        toast.error(err.response?.data?.error || "Signup failed.");
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">
            {isLoginMode ? "Welcome Back!" : "Create Your Account"}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isLoginMode ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => setIsLoginMode(!isLoginMode)}
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              {isLoginMode ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLoginMode && (
            <Input name="name" type="text" placeholder="Full Name" value={formData.name} onChange={handleChange} />
          )}
          <Input name="email" type="email" placeholder="Email Address" value={formData.email} onChange={handleChange} />
          <Input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} />
          
          {!isLoginMode && (
            <>
              <Input name="phone" type="tel" placeholder="Phone Number" value={formData.phone} onChange={handleChange} />
              <Input name="street" type="text" placeholder="Street Address" value={formData.street} onChange={handleChange} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input name="city" type="text" placeholder="City" value={formData.city} onChange={handleChange} />
                <Input name="state" type="text" placeholder="State" value={formData.state} onChange={handleChange} />
              </div>
              <Input name="postalCode" type="text" placeholder="Postal Code" value={formData.postalCode} onChange={handleChange} />
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400"
          >
            {loading ? <FaSpinner className="animate-spin" /> : (isLoginMode ? "Sign In" : "Create Account")}
          </button>
        </form>
      </div>
      <p className="mt-6 text-center text-sm text-gray-600">
        <Link to="/" className="font-medium text-blue-600 hover:text-blue-500">
          &larr; Back to Home
        </Link>
      </p>
    </div>
  );
}
  