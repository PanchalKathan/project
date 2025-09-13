// ProductCard.jsx
import { Link } from "react-router-dom";

export default function ProductCard({ product, handleAddToCart, cartItem, updateQuantity }) {
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 overflow-hidden flex flex-col">
      <Link to={`/products/${product._id}`} className="block">
        <img
          src={product.image || "/placeholder.png"}
          alt={product.name}
          className="w-full h-64 sm:h-72 object-cover"
        />
      </Link>
      <div className="p-4 sm:p-6 flex flex-col flex-grow">
        <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-800">
          {product.name}
        </h3>
        <p className="text-gray-700 font-medium mb-4">₹{product.price}</p>

        <div className="mt-auto">
          {cartItem ? (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => updateQuantity(product._id, "minus")}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-bold"
              >
                -
              </button>
              <span className="font-bold text-lg">{cartItem.quantity}</span>
              <button
                onClick={() => updateQuantity(product._id, "plus")}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-bold"
              >
                +
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleAddToCart(product)}
              className="block w-full text-center bg-blue-600 text-white font-bold py-2 sm:py-3 rounded hover:bg-blue-700 transition"
            >
              Add to Cart
            </button>
          )}

          <Link
            to={`/products/${product._id}`}
            className="block w-full text-center mt-2 bg-gray-100 text-gray-800 font-medium py-2 sm:py-3 rounded hover:bg-gray-200 transition"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
