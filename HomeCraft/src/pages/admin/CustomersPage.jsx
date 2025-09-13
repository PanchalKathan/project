import { useEffect, useState, useMemo, useCallback } from "react";
import adminApi from "../../apis/adminApi";
import { toast } from "react-toastify";
import { FaPlus, FaTimes, FaSearch, FaSpinner } from "react-icons/fa";
import { ConfirmationModal} from "../../components"

const initialFormState = {
  name: "", email: "", phone: "", password: "",
  address: { street: "", city: "", state: "", postalCode: "", country: "IN" },
};

// Modal Component for Add/Edit Customer (No changes needed)
const CustomerModal = ({ isOpen, onClose, onSubmit, form, setForm, editingId }) => {
  if (!isOpen) return null;
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleAddressChange = (e) => setForm({ ...form, address: { ...form.address, [e.target.name]: e.target.value } });
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">{editingId ? "Edit Customer" : "Add New Customer"}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><FaTimes size={20} /></button>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" name="name" placeholder="Full Name" value={form.name} onChange={handleChange} className="w-full p-3 border rounded-lg bg-gray-50" required />
            <input type="email" name="email" placeholder="Email Address" value={form.email} onChange={handleChange} className="w-full p-3 border rounded-lg bg-gray-50" required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" name="phone" placeholder="Phone Number" value={form.phone} onChange={handleChange} className="w-full p-3 border rounded-lg bg-gray-50" />
            {!editingId && <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} className="w-full p-3 border rounded-lg bg-gray-50" required={!editingId} />}
          </div>
          <input type="text" name="street" placeholder="Street Address" value={form.address.street} onChange={handleAddressChange} className="w-full p-3 border rounded-lg bg-gray-50" required />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input type="text" name="city" placeholder="City" value={form.address.city} onChange={handleAddressChange} className="w-full p-3 border rounded-lg bg-gray-50" required />
            <input type="text" name="state" placeholder="State" value={form.address.state} onChange={handleAddressChange} className="w-full p-3 border rounded-lg bg-gray-50" required />
            <input type="text" name="postalCode" placeholder="Postal Code" value={form.address.postalCode} onChange={handleAddressChange} className="w-full p-3 border rounded-lg bg-gray-50" required />
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 font-semibold">Cancel</button>
            <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 font-semibold">{editingId ? "Update Customer" : "Add Customer"}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main Customers Page Component
export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(initialFormState);
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  // State for the new confirmation modal
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.get("/customers");
      setCustomers(data);
    } catch (err) {
      toast.error("Failed to fetch customers.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const filteredCustomers = useMemo(() => {
    return customers.filter(c =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [customers, searchTerm]);

  const openModalForCreate = () => {
    setForm(initialFormState);
    setEditingId(null);
    setIsModalOpen(true);
  };

  const openModalForEdit = (customer) => {
    setForm({ ...initialFormState, ...customer });
    setEditingId(customer._id);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const action = editingId ? "update" : "create";
    try {
      if (editingId) {
        const { password, ...updateData } = form;
        await adminApi.put(`/customers/profile/${editingId}`, updateData);
        toast.success("Customer updated!");
      } else {
        await adminApi.post("/user/signup", form);
        toast.success("Customer created!");
      }
      setIsModalOpen(false);
      fetchCustomers();
    } catch (err) {
      toast.error(`Failed to ${action} customer. ${err.response?.data?.error || ''}`);
    }
  };

  // This function now just opens the confirmation modal
  const handleDelete = (id) => {
    setCustomerToDelete(id);
    setIsConfirmModalOpen(true);
  };
  
  // This new function performs the actual deletion
  const confirmDelete = async () => {
    if (!customerToDelete) return;
    try {
      await adminApi.delete(`/customers/${customerToDelete}`);
      toast.success("Customer deleted!");
      fetchCustomers(); // Refresh data from server
    } catch (err) {
      toast.error("Failed to delete customer.");
    } finally {
      setIsConfirmModalOpen(false);
      setCustomerToDelete(null);
    }
  };
  
  return (
    <div className="p-8 space-y-6">
      <CustomerModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        form={form}
        setForm={setForm}
        editingId={editingId}
      />
      {/* Add the new confirmation modal to the component */}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
        message="Are you sure you want to permanently delete this customer? This action cannot be undone."
      />

      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Customers Management</h1>
        <button onClick={openModalForCreate} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700">
          <FaPlus /> Add Customer
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-md">
        <div className="relative">
          <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
          <input 
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 pl-10 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-md overflow-x-auto relative min-h-[300px]">
        {loading && (
          <div className="absolute inset-0 bg-white/70 flex justify-center items-center z-10">
            <FaSpinner className="animate-spin text-4xl text-indigo-500" />
          </div>
        )}
        <p className="p-4 text-sm text-gray-600">Showing {filteredCustomers.length} of {customers.length} customers.</p>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {!loading && filteredCustomers.length === 0 ? (
               <tr>
                <td colSpan="4" className="text-center py-10 text-gray-500">
                  No customers found.
                </td>
              </tr>
            ) : (
              filteredCustomers.map((c) => (
                <tr key={c._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                      <p className="font-medium text-gray-800">{c.name}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-600">{c.email}</p>
                      <p className="text-sm text-gray-500">{c.phone || "N/A"}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {`${c.address?.street || ''}, ${c.address?.city || ''}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center space-x-4">
                    <button onClick={() => openModalForEdit(c)} className="text-indigo-600 hover:text-indigo-800 font-semibold">Edit</button>
                    {/* The delete button now calls the new handleDelete function */}
                    <button onClick={() => handleDelete(c._id)} className="text-red-600 hover:text-red-800 font-semibold">Delete</button>
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

