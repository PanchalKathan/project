import { useEffect, useState, useMemo, useCallback } from "react";
import adminApi from "../../apis/adminApi";
import { toast } from "react-toastify";
import { FaPlus, FaTimes, FaSearch, FaUserShield } from "react-icons/fa";

const initialFormState = { username: "", password: "" };

// Modal Component for Adding a New Admin
const AdminModal = ({ isOpen, onClose, onSubmit, form, setForm }) => {
  if (!isOpen) return null;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Add New Admin</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><FaTimes size={20} /></button>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input type="text" name="username" placeholder="Enter username" value={form.username} onChange={handleChange} className="w-full p-3 border rounded-lg bg-gray-50" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" name="password" placeholder="Enter a strong password" value={form.password} onChange={handleChange} className="w-full p-3 border rounded-lg bg-gray-50" required />
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 font-semibold">Cancel</button>
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-semibold">Add Admin</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main Admins Page Component
export default function AdminsPage() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(initialFormState);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchAdmins = useCallback(async () => {
    try {
      const res = await adminApi.get("/admin"); // The route is /api/admin for GET
      setAdmins(res.data);
    } catch (err) {
      toast.error("Failed to fetch admins.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const filteredAdmins = useMemo(() => {
    return admins.filter(admin =>
      admin.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [admins, searchTerm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // The route is /api/admin for POST
      await adminApi.post("/admin", form); 
      toast.success("Admin created successfully!");
      fetchAdmins(); // Re-fetch the list to include the new admin
      setIsModalOpen(false);
      setForm(initialFormState);
    } catch (err) {
      toast.error(`Failed to create admin: ${err.response?.data?.error || 'Server error'}`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this admin account? This cannot be undone.")) {
      try {
        // The route is /api/admin/:id for DELETE
        await adminApi.delete(`/admin/${id}`);
        setAdmins(admins.filter((admin) => admin._id !== id));
        toast.success("Admin deleted successfully!");
      } catch (err) {
        toast.error(`Failed to delete admin: ${err.response?.data?.error || 'Server error'}`);
      }
    }
  };

  if (loading) return <div className="p-6 text-center">Loading admins...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <AdminModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        form={form}
        setForm={setForm}
      />
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Manage Admins</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-transform hover:scale-105">
          <FaPlus /> Add Admin
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-md">
        <div className="relative">
          <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
          <input 
            type="text"
            placeholder="Search by username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 pl-10 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-md overflow-x-auto">
        <p className="p-4 text-sm text-gray-600">Showing {filteredAdmins.length} of {admins.length} admins.</p>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin ID</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredAdmins.map((admin) => (
              <tr key={admin._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <FaUserShield className="text-gray-400" />
                    <span className="font-medium text-gray-800">{admin.username}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">{admin._id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center space-x-4">
                  <button onClick={() => handleDelete(admin._id)} className="text-red-600 hover:text-red-800 font-semibold">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
