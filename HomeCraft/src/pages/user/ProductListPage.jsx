// ProductListPage.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import {ProductCard} from "../../components"; // adjust import if needed

const API_URL = "http://localhost:5000/api/products";

export default function ProductListPage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cart, setCart] = useState({});

  const location = useLocation();

  // --- helpers to keep localStorage <-> state in sync ---
  const writeCartToLocalStorage = (cartObj) => {
    const arr = Object.values(cartObj);
    localStorage.setItem("cart", JSON.stringify(arr));
  };

  const upsertItem = (prevCart, product, delta) => {
    const next = { ...prevCart };
    const existing = next[product._id] || { ...product, quantity: 0 };
    const newQty = (existing.quantity || 0) + delta;

    if (newQty <= 0) {
      delete next[product._id];
    } else {
      next[product._id] = { ...existing, quantity: newQty };
    }
    return next;
  };
  // ------------------------------------------------------

  // Load cart from localStorage on first render
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
    const cartObj = savedCart.reduce((acc, item) => {
      acc[item._id] = item;
      return acc;
    }, {});
    setCart(cartObj);
  }, []);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(API_URL);
        setProducts(res.data);
        const uniqueCategories = ["All", ...new Set(res.data.map((p) => p.category))];
        setCategories(uniqueCategories);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProducts();
  }, []);

  // Read category from query params on page load
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const categoryFromQuery = params.get("category");
    if (categoryFromQuery) {
      setSelectedCategory(decodeURIComponent(categoryFromQuery));
    } else {
      setSelectedCategory("All");
    }
  }, [location.search]);

  // Apply category filter
  useEffect(() => {
    if (selectedCategory === "All") {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter((p) => p.category === selectedCategory));
    }
  }, [selectedCategory, products]);

  // Add to Cart
  const handleAddToCart = (product) => {
    setCart((prev) => {
      const next = upsertItem(prev, product, 1);
      writeCartToLocalStorage(next);
      return next;
    });
    toast.success(`✅ ${product.name} added to cart!`);
  };

  // Update quantity (+/-) from card
  const handleUpdateQuantity = (productId, type) => {
    setCart((prev) => {
      const product = prev[productId] || products.find((p) => p._id === productId);
      if (!product) return prev; // nothing to update

      const delta = type === "plus" ? 1 : -1;
      const next = upsertItem(prev, product, delta);
      writeCartToLocalStorage(next);

      // Optional: toast when removing
      if (!next[productId]) {
        toast.info(`Removed ${product.name} from cart`);
      }
      return next;
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
          Explore Our Products
        </h2>
        <p className="text-gray-600 text-lg sm:text-xl max-w-2xl mx-auto">
          Find the perfect furniture, decor, and electronics to enhance your home.
        </p>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mt-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              handleAddToCart={handleAddToCart}
              cartItem={cart[product._id]}
              updateQuantity={handleUpdateQuantity} // <-- pass it down
            />
          ))}
        </div>
      </div>
    </div>
  );
}
