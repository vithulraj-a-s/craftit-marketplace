import React, { createContext, useContext, useState, useEffect } from "react";
import {
  loginUser,
  getCurrentUser,
  logoutUser,
} from "../services/authService";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("access");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (err) {
        console.error("Session expired", err);
        localStorage.clear();
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await loginUser({ email, password });

    localStorage.setItem("access", res.access);
    localStorage.setItem("refresh", res.refresh);

    setUser(res.user);

    return res.user;
  };

  const logout = async () => {
    const refresh = localStorage.getItem("refresh");

    try {
      await logoutUser({ refresh });
    } catch (err) {
      console.log("Logout error", err);
    }

    localStorage.clear();
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    setUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}