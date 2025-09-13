import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaBox, FaUsers, FaShoppingCart, FaRupeeSign, FaReceipt, FaSpinner } from "react-icons/fa";
import adminApi from "../../apis/adminApi";
import { toast } from "react-toastify";

export default function DashboardPage() {
  const [stats, setStats] = useState({ products: 0, customers: 0, orders: 0, revenue: 0 });
  const [recentOrders, setRecentOrders] = useState([]); // State for dynamic recent orders
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all required data in parallel for performance
        const [productsRes, customersRes, ordersRes] = await Promise.all([
          adminApi.get("/products"),
          adminApi.get("/customers"),
          adminApi.get("/orders"),
        ]);
        
        // Calculate total revenue from all orders
        const totalRevenue = ordersRes.data.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        
        setStats({
          products: productsRes.data.length,
          customers: customersRes.data.length,
          orders: ordersRes.data.length,
          revenue: totalRevenue,
        });

        // Your /api/orders route already sorts by newest first.
        // We can just take the first 5 items for the "Recent Orders" list.
        setRecentOrders(ordersRes.data.slice(0, 5));

      } catch (err) {
        toast.error("Failed to fetch dashboard data.");
        console.error("Dashboard Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statCards = [
    { title: "Total Revenue", value: `₹${stats.revenue.toLocaleString('en-IN')}`, icon: FaRupeeSign, color: "text-green-500", path: "/admin/orders" },
    { title: "Total Orders", value: stats.orders, icon: FaShoppingCart, color: "text-yellow-500", path: "/admin/orders" },
    { title: "Total Products", value: stats.products, icon: FaBox, color: "text-blue-500", path: "/admin/products" },
    { title: "Total Customers", value: stats.customers, icon: FaUsers, color: "text-purple-500", path: "/admin/customers" },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-4xl text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
      
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <Link to={card.path} key={card.title} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">{card.title}</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{card.value}</p>
            </div>
            <div className={`p-3 rounded-full ${card.color.replace('text', 'bg').replace('500', '100')}`}>
              <card.icon size={24} className={card.color} />
            </div>
          </Link>
        ))}
      </div>
      
      {/* Recent Orders Section */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2"><FaReceipt /> Recent Orders</h2>
        <div className="space-y-4">
          {recentOrders.length > 0 ? (
            recentOrders.map((order) => (
              <div key={order._id} className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-gray-800">{order.customer?.name || "N/A"}</p>
                  <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <p className="font-bold text-gray-700">₹{order.totalAmount.toLocaleString('en-IN')}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No recent orders found.</p>
          )}
          <Link to="/admin/orders" className="text-indigo-600 hover:underline font-semibold pt-4 block text-center">
            View All Orders
          </Link>
        </div>
      </div>
    </div>
  );
}