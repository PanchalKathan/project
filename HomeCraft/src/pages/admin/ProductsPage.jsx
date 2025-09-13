import { useEffect, useState, useMemo, useCallback } from "react";
import api from "../../apis/adminApi";
import { toast } from "react-toastify";
import { FaPlus, FaTimes, FaSearch, FaSpinner } from "react-icons/fa";
import { ConfirmationModal } from "../../components";

const initialFormState = { name: "", description: "", price: "", image: "", category: "", stock: 0 };

// Modal Component for Add/Edit Form
const ProductModal = ({ isOpen, onClose, onSubmit, form, setForm, editingId, categories }) => {
  if (!isOpen) return null;
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">{editingId ? "Edit Product" : "Add New Product"}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><FaTimes size={20} /></button>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" name="name" placeholder="Product Name" value={form.name} onChange={handleChange} className="w-full p-3 border rounded-lg bg-gray-50" required />
            <select name="category" value={form.category} onChange={handleChange} className="w-full p-3 border rounded-lg bg-gray-50" required>
              <option value="">Select Category</option>
              {/* Use the static list of categories for the dropdown */}
              {categories.filter(c => c !== "All").map((cat) => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} className="w-full p-3 border rounded-lg bg-gray-50" rows="4" required />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="number" name="price" placeholder="Price (₹)" value={form.price} onChange={handleChange} className="w-full p-3 border rounded-lg bg-gray-50" required min="0" />
            <input type="number" name="stock" placeholder="Stock Quantity" value={form.stock} onChange={handleChange} className="w-full p-3 border rounded-lg bg-gray-50" required min="0" />
          </div>
          <input type="text" name="image" placeholder="Image URL" value={form.image} onChange={handleChange} className="w-full p-3 border rounded-lg bg-gray-50" />
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 font-semibold">Cancel</button>
            <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 font-semibold">{editingId ? "Update Product" : "Add Product"}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main Products Page Component
export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(initialFormState);
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  // --- BUG FIX: Use a static list of categories as the source of truth ---
  const categories = ["All", "Furniture", "Home Decor", "Home Appliances & Electronics", "Outdoor & Garden", "Storage & Organization", "Kitchen & Dining", "Bedding & Bath"];
  // --------------------------------------------------------------------

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/products");
      setProducts(data);
    } catch (err) {
      toast.error("Failed to fetch products.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filteredProducts = useMemo(() => {
    return products
      .filter(p => selectedCategory === "All" || p.category === selectedCategory)
      .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [products, selectedCategory, searchTerm]);

  const openModalForCreate = () => {
    setForm(initialFormState);
    setEditingId(null);
    setIsModalOpen(true);
  };

  const openModalForEdit = (product) => {
    setForm(product);
    setEditingId(product._id);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const action = editingId ? "update" : "create";
    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, form);
        toast.success("Product updated!");
      } else {
        await api.post("/products", form);
        toast.success("Product created!");
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      toast.error(`Failed to ${action} product.`);
    }
  };

  const handleDelete = (id) => {
    setProductToDelete(id);
    setIsConfirmModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    try {
      await api.delete(`/products/${productToDelete}`);
      toast.success("Product deleted!");
      fetchProducts();
    } catch (err) {
      toast.error("Failed to delete product.");
    } finally {
      setIsConfirmModalOpen(false);
      setProductToDelete(null);
    }
  };
  
  return (
    <div className="p-8 space-y-6">
      <ProductModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        form={form}
        setForm={setForm}
        editingId={editingId}
        categories={categories}
      />
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={confirmDelete}
        title="Confirm Deletion"
        message="Are you sure you want to permanently delete this product?"
      />
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Products Management</h1>
        <button onClick={openModalForCreate} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-transform hover:scale-105">
          <FaPlus /> Add Product
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-md space-y-4">
        <div className="relative">
          <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
          <input 
            type="text"
            placeholder="Search products by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 pl-10 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {categories.map(cat => (
            <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-3 py-1 text-sm rounded-full font-medium transition ${selectedCategory === cat ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}>
              {cat}
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
        <p className="p-4 text-sm text-gray-600 font-medium">Showing {filteredProducts.length} of {products.length} products.</p>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name & Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {!loading && filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-10 text-gray-500">
                  No products match your criteria.
                </td>
              </tr>
            ) : (
              filteredProducts.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap"><img src={p.image || 'https://placehold.co/100x100/e2e8f0/e2e8f0'} alt={p.name} className="w-12 h-12 object-cover rounded-md" /></td>
                  <td className="px-6 py-4 whitespace-nowrap"><p className="font-medium text-gray-800">{p.name}</p><p className="text-sm text-gray-500 font-normal">{p.category}</p></td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">₹{p.price.toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{p.stock > 0 ? p.stock : <span className="text-red-500 font-semibold px-2 py-1 bg-red-100 rounded-full text-xs">Out of Stock</span>}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center space-x-4">
                    <button onClick={() => openModalForEdit(p)} className="text-indigo-600 hover:text-indigo-800 font-semibold">Edit</button>
                    <button onClick={() => handleDelete(p._id)} className="text-red-600 hover:text-red-800 font-semibold">Delete</button>
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