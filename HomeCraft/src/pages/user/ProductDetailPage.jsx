import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { FaStar, FaStarHalfAlt, FaRegStar, FaShoppingCart } from "react-icons/fa";
import { toast } from "react-toastify";

const API_URL = "http://localhost:5000/api/products";

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mainImage, setMainImage] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(`${API_URL}/${id}`);
        setProduct(res.data);
        setMainImage(res.data.image || "/placeholder.png");
      } catch (err) {
        setError("Could not load the product. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // Rating Display
  const renderRating = () => {
    if (!product?.rating) return <span className="text-gray-500">No reviews yet</span>;
    const stars = [];
    const fullStars = Math.floor(product.rating);
    const halfStar = product.rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    for (let i = 0; i < fullStars; i++) stars.push(<FaStar key={`full-${i}`} className="text-yellow-400" />);
    if (halfStar) stars.push(<FaStarHalfAlt key="half" className="text-yellow-400" />);
    for (let i = 0; i < emptyStars; i++) stars.push(<FaRegStar key={`empty-${i}`} className="text-yellow-400" />);
    return stars;
  };

  // Add to cart
  const handleAddToCart = () => {
    if (!product) return;
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingItem = cart.find((item) => item._id === product._id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({ ...product, quantity });
    }
    localStorage.setItem("cart", JSON.stringify(cart));

    toast.success(`${quantity} × ${product.name} added to cart!`);
  };

  if (loading) return <p className="text-center py-20 text-xl font-semibold">Loading Product...</p>;
  if (error) return <p className="text-center py-20 text-xl font-semibold text-red-500">{error}</p>;
  if (!product) return null;

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        {/* Image Gallery */}
        <div>
          <img
            src={mainImage}
            alt={product.name}
            className="w-full h-auto aspect-square object-cover rounded-2xl shadow-xl mb-4 transition-all"
          />
          <div className="flex space-x-3 overflow-x-auto py-2">
            {[product.image, ...(product.images || [])].filter(Boolean).map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`${product.name} thumbnail ${index + 1}`}
                className={`w-24 h-24 object-cover rounded-lg cursor-pointer border-2 transition-all duration-200 ${
                  img === mainImage
                    ? "border-blue-600 ring-2 ring-blue-300"
                    : "border-gray-200 hover:border-blue-400"
                }`}
                onClick={() => setMainImage(img)}
              />
            ))}
          </div>
        </div>

        {/* Product Details */}
        <div className="flex flex-col">
            <span className="text-sm font-medium text-blue-600 bg-blue-100 py-1 px-3 rounded-full self-start mb-3">{product.category}</span>
          <h1 className="text-4xl font-extrabold mb-3 text-gray-900 tracking-tight">
            {product.name}
          </h1>
          <div className="flex items-center mb-4 space-x-2 text-lg">
            {renderRating()}
            <span className="ml-2 text-gray-600">({product.rating || "0"} reviews)</span>
          </div>

          <p className="text-3xl font-semibold text-gray-800 mb-6">
            ₹{product.price.toLocaleString('en-IN')}
          </p>
          <p className="text-gray-700 mb-8 leading-relaxed text-lg">
            {product.description}
          </p>

          {/* Quantity Selector */}
          <div className="flex items-center mb-8 space-x-4">
            <label className="font-medium text-lg text-gray-800">Quantity:</label>
            <div className="flex items-center border rounded-lg overflow-hidden shadow-sm">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 transition font-bold text-lg"
              >
                -
              </button>
              <span className="px-6 py-2 font-bold text-lg">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 transition font-bold text-lg"
              >
                +
              </button>
            </div>
          </div>

          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            className="flex items-center justify-center gap-3 bg-blue-600 text-white 
                       font-semibold py-4 px-8 rounded-xl shadow-lg hover:bg-blue-700
                       transition-all duration-300 text-lg w-full transform hover:scale-105"
          >
            <FaShoppingCart className="text-xl" />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
