import { useEffect, useState, useMemo, useCallback } from "react";
import api from "../../apis/adminApi";
import { toast } from "react-toastify";
import { FaSearch, FaSpinner } from "react-icons/fa";
import { ConfirmationModal } from "../../components"; // 1. Import the reusable modal

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  // State for the new confirmation modal
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);

  const statuses = ["All", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/orders");
      setOrders(data);
    } catch (err) {
      toast.error("Failed to fetch orders.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = useMemo(() => {
    return orders
      .filter(o => selectedStatus === "All" || o.status === selectedStatus)
      .filter(o =>
        (o.customer?.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (o._id.toLowerCase().includes(searchTerm.toLowerCase()))
      );
  }, [orders, selectedStatus, searchTerm]);

  // --- CRITICAL FIX: Re-fetch data after update to prevent crash ---
  const updateStatus = async (id, status) => {
    try {
      await api.put(`/orders/${id}`, { status });
      toast.success(`Order status updated to ${status}.`);
      fetchOrders(); // Re-fetch the entire list to ensure data consistency
    } catch (err) {
      toast.error("Failed to update order status.");
    }
  };
  
  // Update delete handler to use the modal
  const handleDelete = (id) => {
    setOrderToDelete(id);
    setIsConfirmModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!orderToDelete) return;
    try {
      await api.delete(`/orders/${orderToDelete}`);
      toast.success("Order deleted successfully!");
      fetchOrders(); // Re-fetch after delete
    } catch (err) {
      toast.error("Failed to delete order.");
    } finally {
      setIsConfirmModalOpen(false);
      setOrderToDelete(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered": return "bg-green-100 text-green-800 border-green-300";
      case "Shipped": return "bg-blue-100 text-blue-800 border-blue-300";
      case "Processing": return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "Cancelled": return "bg-red-100 text-red-800 border-red-300";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <div className="p-8 space-y-6">
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
        message="Are you sure you want to permanently delete this order?"
      />
      <h1 className="text-3xl font-bold text-gray-800">Orders Management</h1>

      <div className="bg-white p-4 rounded-xl shadow-md space-y-4">
        <div className="relative">
          <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
          <input 
            type="text"
            placeholder="Search by Order ID or Customer Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 pl-10 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {statuses.map(status => (
            <button key={status} onClick={() => setSelectedStatus(status)} className={`px-3 py-1 text-sm rounded-full font-medium transition ${selectedStatus === status ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}>
              {status}
            </button>
          ))}
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-md overflow-x-auto relative min-h-[300px]">
        {loading && (
          <div className="absolute inset-0 bg-white/70 flex justify-center items-center z-10">
            <FaSpinner className="animate-spin text-4xl text-indigo-500" />
          </div>
        )}
        <p className="p-4 text-sm text-gray-600">Showing {filteredOrders.length} of {orders.length} orders.</p>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order Details</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {!loading && filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-10 text-gray-500">
                  No orders match your criteria.
                </td>
              </tr>
            ) : (
              filteredOrders.map((o) => (
                <tr key={o._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="font-mono text-sm text-gray-800">{o._id}</p>
                    <p className="text-xs text-gray-500">{new Date(o.createdAt).toLocaleString()}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-800">{o.customer?.name || "N/A"}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-700">₹{o.totalAmount.toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={o.status}
                      onChange={(e) => updateStatus(o._id, e.target.value)}
                      className={`p-2 border rounded-lg focus:outline-none font-semibold text-sm ${getStatusColor(o.status)}`}
                    >
                      {statuses.filter(s => s !== "All").map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button onClick={() => handleDelete(o._id)} className="text-red-600 hover:text-red-800 font-semibold">
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}