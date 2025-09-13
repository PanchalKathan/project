import React from 'react'
import { NavLink } from 'react-router-dom';

function AdminSidebar() {
  return (
    <div>
          <aside className="w-64 bg-gray-900 text-white flex flex-col justify-between min-h-screen p-6">
          <div>
            <h1 className="text-2xl font-bold mb-8">HomeCraft Admin</h1>
            <nav className="flex flex-col gap-3">
              <NavLink
                to="/admin/dashboard"
                className={({ isActive }) =>
                  `px-3 py-2 rounded ${
                    isActive
                      ? "bg-yellow-500 text-black font-bold"
                      : "hover:bg-gray-700"
                  }`
                }
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/admin/products"
                className={({ isActive }) =>
                  `px-3 py-2 rounded ${
                    isActive
                      ? "bg-yellow-500 text-black font-bold"
                      : "hover:bg-gray-700"
                  }`
                }
              >
                Products
              </NavLink>
              <NavLink
                to="/admin/customers"
                className={({ isActive }) =>
                  `px-3 py-2 rounded ${
                    isActive
                      ? "bg-yellow-500 text-black font-bold"
                      : "hover:bg-gray-700"
                  }`
                }
              >
                Customers
              </NavLink>
              <NavLink
                to="/admin/orders"
                className={({ isActive }) =>
                  `px-3 py-2 rounded ${
                    isActive
                      ? "bg-yellow-500 text-black font-bold"
                      : "hover:bg-gray-700"
                  }`
                }
              >
                Orders
              </NavLink>
            </nav>
          </div>
        </aside>
    </div>
  )
}

export default AdminSidebar