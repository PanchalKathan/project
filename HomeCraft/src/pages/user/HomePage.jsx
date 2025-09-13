import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { ProductCard } from "../../components"; 

const API_URL = "http://localhost:5000/api/products";

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState({});

  // --- helpers to sync cart ---
  const writeCartToLocalStorage = (cartObj) => {
    localStorage.setItem("cart", JSON.stringify(Object.values(cartObj)));
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

  // ✅ Load cart from localStorage on first render
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
    const cartObj = savedCart.reduce((acc, item) => {
      acc[item._id] = item;
      return acc;
    }, {});
    setCart(cartObj);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(API_URL);
        const products = res.data;

        setFeaturedProducts(products.slice(0, 6)); // First 6 featured
        const uniqueCategories = [...new Set(products.map((p) => p.category))];
        setCategories(uniqueCategories);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      }
    };
    fetchProducts();
  }, []);

  // ✅ Add to Cart
  const handleAddToCart = (product) => {
    setCart((prev) => {
      const next = upsertItem(prev, product, 1);
      writeCartToLocalStorage(next);
      return next;
    });
    // Defer the toast call to avoid updating a component while rendering another.
    setTimeout(() => {
      toast.success(`${product.name} added to cart!`);
    }, 0);
  };

  // ✅ Update quantity (+/-)
  const handleUpdateQuantity = (productId, type) => {
    setCart((prev) => {
      const product = prev[productId] || featuredProducts.find((p) => p._id === productId);
      if (!product) return prev;

      const delta = type === "plus" ? 1 : -1;
      const next = upsertItem(prev, product, delta);
      writeCartToLocalStorage(next);

      if (!next[productId]) {
        // Defer the toast call
        setTimeout(() => {
          toast.info(`Removed ${product.name} from cart`);
        }, 0);
      }
      return next;
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-100 to-blue-50 py-20 px-6 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-blue-700">
          Transform Your Home with Quality Products
        </h1>
        <p className="text-gray-700 mb-6 text-lg sm:text-xl max-w-2xl mx-auto">
          Discover furniture, home decor, and appliances crafted for comfort and style.
        </p>
        <Link
          to="/products"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Shop Now
        </Link>
      </section>

      {/* Popular Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold mb-10 text-center text-gray-800">
          Shop by Category
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {categories.map((cat, idx) => (
            <Link
              key={idx}
              to={`/products?category=${encodeURIComponent(cat)}`}
              className="bg-gradient-to-r from-indigo-100 to-indigo-50 rounded-xl shadow hover:shadow-lg p-6 flex items-center justify-center text-lg font-semibold text-indigo-700 hover:bg-indigo-200 transition"
            >
              {cat}
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold mb-10 text-center text-gray-800">
          Featured Products
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              handleAddToCart={handleAddToCart}
              cartItem={cart[product._id]}
              updateQuantity={handleUpdateQuantity}
            />
          ))}
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section className="bg-gradient-to-r from-green-100 to-green-50 py-16 px-6 text-center">
        <h2 className="text-3xl font-bold mb-4 text-green-800">
          Ready to Upgrade Your Home?
        </h2>
        <p className="text-gray-700 mb-6 text-lg max-w-xl mx-auto">
          Shop our collection and bring comfort, style, and functionality to every room.
        </p>
        <Link
          to="/products"
          className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
        >
          Explore All Products
        </Link>
      </section>
    </div>
  );
}