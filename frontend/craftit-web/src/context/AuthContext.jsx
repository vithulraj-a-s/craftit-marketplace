import React, { createContext, useContext, useState, useEffect, useRef } from "react";
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
  const [unreadMap, setUnreadMap] = useState({});
  const wsRef = useRef(null);

  const fetchUnreadCounts = async () => {
    if (!user?.id) return;
    try {
      const response = await fetch(`http://localhost:8001/chat/conversations/?user_id=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        const map = {};
        data.forEach(item => {
          map[item.conversation_id] = item.unread_count;
        });
        setUnreadMap(map);
      }
    } catch (err) {
      console.error("Failed to fetch unread counts", err);
    }
  };

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

  // Hydrate unread counts initially on user login or refresh
  useEffect(() => {
    if (user?.id) {
      fetchUnreadCounts();
    } else {
      setUnreadMap({});
    }
  }, [user?.id]);

  // Global notification websocket connection
  useEffect(() => {
    console.log("WEBSOCKET EFFECT RUNNING");
    console.log("USER:", user);
    console.log("CURRENT SOCKET:", wsRef.current);
    if (!user?.id) {
      if (wsRef.current) {
        console.log("Closing active socket due to logout/user clearance");
        wsRef.current.close();
        wsRef.current = null;
      }
      return;
    }

    console.log("Establishing single global notification socket...");
    if (wsRef.current) {
      console.log("⚠️ Closing stale socket before creating new one");
      wsRef.current.close();
    }
    const wsUrl = "ws://localhost:8001/ws/notifications/";
    const socket = new WebSocket(wsUrl);
    wsRef.current = socket;

    socket.onopen = () => {
      console.log("Notification socket connected");
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Unread websocket event:", data);

        if (data.type === "unread_update") {
          setUnreadMap(prev => ({
            ...prev,
            [data.conversation_id]: data.unread_count
          }));
        }
      } catch (err) {
        console.error("Failed to parse notification socket event:", err);
      }
    };

    socket.onerror = (err) => {
      console.error("Notification socket error:", err);
    };

    socket.onclose = (event) => {
      console.log("❌ SOCKET CLOSED");
      console.log("CODE:", event.code);
      console.log("REASON:", event.reason);

      if (wsRef.current === socket) {
        wsRef.current = null;
      }
    };

    return () => {
      console.log("Cleaning up WebSocket connection for user:", user.id);
      socket.close();
      if (wsRef.current === socket) {
        wsRef.current = null;
      }
    };
  }, [user?.id]);

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
    unreadMap,
    setUnreadMap,
    fetchUnreadCounts,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}