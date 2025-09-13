import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaSignOutAlt } from 'react-icons/fa';

export default function AdminHeader() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/admin/login");
  };

  const linkStyles = ({ isActive }) =>
    `px-4 py-2 rounded-md font-semibold transition-colors duration-300 ${
      isActive
        ? "bg-blue-600 text-white"
        : "text-gray-600 hover:bg-gray-200"
    }`;

  return (
    <header className="bg-white shadow-md sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-800">HomeCraft Admin</h1>
          </div>
          <nav className="hidden md:flex items-center gap-4">
            <NavLink to="/admin/dashboard" className={linkStyles}>Dashboard</NavLink>
            <NavLink to="/admin/products" className={linkStyles}>Products</NavLink>
            <NavLink to="/admin/customers" className={linkStyles}>Customers</NavLink>
            <NavLink to="/admin/orders" className={linkStyles}>Orders</NavLink>
            {/* highlight-start */}
            {/* This is the new link to your admin management page */}
            <NavLink to="/admin/admins" className={linkStyles}>Admins</NavLink>
            {/* highlight-end */}
          </nav>
          <div className="flex items-center">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

