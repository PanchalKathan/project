import { createContext, useState, useEffect, useContext } from "react";
import { jwtDecode } from "jwt-decode";
import adminApi from "../apis/adminApi"; // Use the new admin-specific API client

export const AdminAuthContext = createContext(null);

// Custom hook for easier consumption in admin pages
export const useAdminAuth = () => useContext(AdminAuthContext);

export const AdminAuthProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const verifyAdminAuth = async () => {
      // It looks for 'adminToken', completely separate from the customer token
      const token = localStorage.getItem("adminToken");
      if (!token) {
        setIsAuthLoading(false);
        return;
      }

      try {
        const decoded = jwtDecode(token);
        // Security check: if the token is not for an admin, log out
        if (!decoded.isAdmin) {
          throw new Error("Invalid admin token");
        }
        
        const res = await adminApi.get("/admin/profile");
        login(res.data, token);

      } catch (error) {
        console.error("Admin auth verification failed", error);
        logout();
      } finally {
        setIsAuthLoading(false);
      }
    };

    verifyAdminAuth();
  }, []);

  const login = (userData, userToken) => {
    localStorage.setItem("adminUser", JSON.stringify(userData));
    localStorage.setItem("adminToken", userToken);
    setAdminUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("adminUser");
    localStorage.removeItem("adminToken");
    setAdminUser(null);
  };

  return (
    <AdminAuthContext.Provider value={{ adminUser, isAuthLoading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};