import { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate, Link } from "react-router-dom";
import { FaShoppingCart, FaUserCircle, FaSignOutAlt, FaBoxOpen } from "react-icons/fa";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";

export default function UserHeader() {
  const { user, logout } = useAuth();
  const [cartCount, setCartCount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // This useEffect now syncs the cart count with localStorage and a window event
  useEffect(() => {
    const updateCartCount = () => {
      const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
      setCartCount(cartItems.reduce((acc, item) => acc + item.quantity, 0));
    };

    updateCartCount(); // Initial count on component load

    // Listen for a custom event that other components will fire when the cart changes
    window.addEventListener('cartUpdated', updateCartCount);

    // Cleanup function to remove the listener when the component unmounts
    return () => window.removeEventListener('cartUpdated', updateCartCount);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    navigate("/");
    toast.success("You have been logged out successfully.");
  };

  const linkStyles = ({ isActive }) =>
    `text-sm transition-colors duration-200 ${
      isActive
        ? "font-semibold text-indigo-600"
        : "font-medium text-gray-500 hover:text-gray-900"
    }`;

  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-20 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-1 flex justify-start">
            <Link to="/" className="text-2xl font-bold text-gray-900 tracking-tight">
              HomeCraft
            </Link>
          </div>
          <nav className="hidden lg:flex items-center gap-10">
            <NavLink to="/" className={linkStyles} end>Home</NavLink>
            <NavLink to="/products" className={linkStyles}>All Products</NavLink>
          </nav>
          <div className="flex-1 flex justify-end items-center gap-5">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="text-gray-600 hover:text-indigo-600 focus:outline-none">
                  <FaUserCircle size={26} />
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-30 ring-1 ring-black ring-opacity-5">
                    <div className="px-4 py-3 border-b">
                      <p className="text-sm text-gray-500">Signed in as</p>
                      <p className="text-sm font-semibold text-gray-800 truncate">{user.name}</p>
                    </div>
                    <Link to="/profile" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <FaUserCircle /> My Profile
                    </Link>
                    <Link to="/profile" state={{ initialTab: 'orders' }} onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <FaBoxOpen /> My Orders
                    </Link>
                    <button onClick={handleLogout} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <FaSignOutAlt /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden lg:flex items-center gap-2">
                 <NavLink 
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
                >
                  Sign In/Sign Up
                </NavLink>
              </div>
            )}
            <NavLink to="/cart" className="relative text-gray-600 hover:text-indigo-600 transition-colors">
              <FaShoppingCart size={24} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-3 bg-indigo-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </NavLink>
          </div>
        </div>
      </div>
    </header>
  );
}