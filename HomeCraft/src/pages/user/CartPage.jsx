import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaTrashAlt, FaPlus, FaMinus, FaShoppingCart } from "react-icons/fa";

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCartItems(savedCart); 
  }, []);

  // A single function to handle quantity changes (+ or -)
  const handleQuantityChange = (id, type) => {
    let updatedCart = [...cartItems];
    const itemIndex = updatedCart.findIndex((item) => item._id === id);

    if (itemIndex === -1) return;
    
    const itemToUpdate = { ...updatedCart[itemIndex] };

    if (type === "increment") {
      itemToUpdate.quantity += 1;
    } else if (type === "decrement") {
      itemToUpdate.quantity -= 1;
    }

    if (itemToUpdate.quantity < 1) {
      // If quantity drops to 0, remove the item
      updatedCart = updatedCart.filter((item) => item._id !== id);
      toast.error(`${itemToUpdate.name} removed from cart!`);
    } else {
      updatedCart[itemIndex] = itemToUpdate;
      toast.info("Cart updated successfully!");
    }
    
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const handleRemoveItem = (id) => {
      const updatedCart = cartItems.filter((item) => item._id !== id);
      setCartItems(updatedCart);
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      toast.error("Item removed from cart!");
  };

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const tax = subtotal * 0.18; // 18% GST
  const shipping = subtotal > 500 ? 0 : 50; // Example: Free shipping for orders above 500
  const total = subtotal + tax + shipping;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">
            Shopping Cart
          </h1>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center bg-white p-12 rounded-xl shadow-md">
            <FaShoppingCart className="mx-auto text-6xl text-gray-300 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-6">Looks like you haven't added anything to your cart yet.</p>
            <Link to="/products" className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition duration-300">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-start">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center bg-white shadow-md rounded-xl p-4 transition-transform hover:scale-[1.01]"
                >
                  <img
                    src={item.image || "/placeholder.png"}
                    alt={item.name}
                    className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-lg"
                  />
                  <div className="flex-1 ml-4">
                    <h2 className="font-bold text-lg text-gray-800">{item.name}</h2>
                    <p className="text-gray-500 text-sm">₹{item.price.toLocaleString('en-IN')}</p>

                    <div className="flex items-center mt-3">
                      <button onClick={() => handleQuantityChange(item._id, "decrement")} className="p-2 bg-gray-200 rounded-l-lg hover:bg-gray-300"><FaMinus size={12} /></button>
                      <span className="px-4 py-1 bg-white border-t border-b font-semibold">{item.quantity}</span>
                      <button onClick={() => handleQuantityChange(item._id, "increment")} className="p-2 bg-gray-200 rounded-r-lg hover:bg-gray-300"><FaPlus size={12} /></button>
                    </div>
                  </div>

                  <div className="text-right ml-4">
                     <p className="font-bold text-lg text-gray-800 mb-2">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                     </p>
                     <button
                        onClick={() => handleRemoveItem(item._id)}
                        className="text-gray-400 hover:text-red-500 transition"
                      >
                        <FaTrashAlt size={18} />
                      </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="bg-white shadow-md rounded-xl p-6 lg:sticky lg:top-24">
              <h2 className="text-2xl font-bold mb-6 border-b pb-4">Order Summary</h2>
              <div className="space-y-4 text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                 <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-medium">{shipping === 0 ? 'FREE' : `₹${shipping.toLocaleString('en-IN')}`}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (18% GST)</span>
                  <span className="font-medium">₹{tax.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between font-bold text-xl text-gray-800 border-t pt-4 mt-4">
                  <span>Total</span>
                  <span>₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
              <button
                onClick={() =>
                  navigate("/payment", { state: { cartItems, total } })
                }
                className="mt-6 w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition transform hover:scale-105"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
