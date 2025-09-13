import { createContext, useState, useEffect, useContext } from "react";
import api from "../apis/api"; // The original API client for customers

export const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      // This context now only cares about the regular customer 'token'
      const token = localStorage.getItem("token");
      if (!token) {
        setIsAuthLoading(false);
        return;
      }

      try {
        // It now only ever calls the customer profile endpoint
        const res = await api.get("/customers/profile");
        login(res.data, token);
      } catch (error) {
        console.error("Customer auth verification failed", error);
        logout();
      } finally {
        setIsAuthLoading(false);
      }
    };

    verifyAuth();
  }, []);

  const login = (userData, userToken) => {
    // It uses 'user' and 'token' keys in localStorage
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", userToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthLoading, login, logout }}>
      {!isAuthLoading && children}
    </AuthContext.Provider>
  );
};