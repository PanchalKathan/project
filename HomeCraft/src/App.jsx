import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { FaSpinner } from "react-icons/fa";

// Import pages and components
import { CustomersPage, DashboardPage, ProductsPage, OrdersPage, LoginPage, AdminsPage } from "./pages/admin";
import { HomePage, ProductListPage, ProductDetailPage, CartPage, PaymentPage, ProfilePage, SuccessPage,AuthPage } from "./pages/user";
import { UserLayout, AdminLayout } from "./components";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Import BOTH the customer and the new admin auth providers and hooks
import { AuthProvider } from './context/AuthContext';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';

function App() {
  return (
    // Nest the providers. This makes both available throughout the app,
    // but they operate independently and do not conflict.
    <AuthProvider>
      <AdminAuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AdminAuthProvider>
    </AuthProvider>
  );
}

// CRITICAL FIX: The PrivateRoute now uses the dedicated admin auth hook.
function PrivateRoute({ children }) {
  const { adminUser, isAuthLoading } = useAdminAuth();

  if (isAuthLoading) {
    return (
      <div className="flex justify-center items-center h-screen w-full">
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
      </div>
    );
  }

  // It now ONLY checks for the existence of an `adminUser`.
  if (!adminUser) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

function AppContent() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <main className="w-full">
        <Routes>
          {/* Admin Login Route (standalone) */}
          <Route path="/admin/login" element={<LoginPage />} />

          {/* Protected Admin Routes */}
          <Route path="/admin" element={<PrivateRoute><AdminLayout /></PrivateRoute>}>
            <Route index element={<Navigate to="dashboard" />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="admins" element={<AdminsPage />} />
          </Route>

          {/* User Routes */}
          <Route element={<UserLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductListPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/login" element={<AuthPage />} />
          </Route>
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/success" element={<SuccessPage />} />
        </Routes>
      </main>
      
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
}

export default App;