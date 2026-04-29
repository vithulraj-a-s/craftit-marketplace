import React, { createContext, useContext, useState, useEffect } from "react";
import axiosInstance from "../services/axiosInstance";
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
        try {
          const response = await axiosInstance.get("/auth/me/", { _retry: true });
          setUser(response.data);
        } catch (err) {
          // 🔥 IMPORTANT: DO NOT TRIGGER ANYTHING HERE
          setUser(null);
        } finally {
          setLoading(false);
        }
      };

      initAuth();
    }, []);

  const login = async (email, password) => {
    await loginUser({ email, password });

    // 🔥 get user AFTER cookies are set
    const userData = await getCurrentUser();
    setUser(userData);

    return userData;
  };

  const logout = async () => {
  try {
    await logoutUser(); // 🔥 no body
  } catch (err) {
    console.log("Logout error", err);
  }

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