import { useState } from "react";
import { useNavigate } from "react-router-dom";
import adminApi from "../../apis/adminApi"; // FIX: Use the admin-specific API client
import { useAdminAuth } from "../../context/AdminAuthContext"; // FIX: Use the new admin auth hook
import { FaSpinner } from "react-icons/fa";
import { toast } from "react-toastify";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAdminAuth(); // FIX: Get the login function from our new context

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Use the adminApi client to make the login request
      const res = await adminApi.post("/admin/login", { username, password });
      
      // CRITICAL FIX: Use the login function from the AdminAuthContext.
      // This correctly saves 'adminUser' and 'adminToken' and updates the app state.
      login(res.data.user, res.data.token);
      
      navigate("/admin/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.error || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm"
      >
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Admin Login
        </h1>

        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">
            Username
          </label>
          <input
            type="text"
            placeholder="Enter your username"
            className="border rounded-lg w-full p-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-2">
            Password
          </label>
          <input
            type="password"
            placeholder="Enter your password"
            className="border rounded-lg w-full p-3 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold shadow-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex justify-center items-center"
          disabled={loading}
        >
          {loading ? <FaSpinner className="animate-spin" /> : "Login"}
        </button>
      </form>
    </div>
  );
}