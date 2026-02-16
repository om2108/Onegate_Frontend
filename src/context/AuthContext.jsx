// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { setAuthToken } from "../api/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        setAuthToken(token);
        const payload = JSON.parse(atob(token.split(".")[1]));

        setUser({
          id: payload.id, // ⭐ ADD THIS
          email: payload.sub,
          role: payload.role,
          token,
        });
      } catch (err) {
        alert("Invalid or expired session. Please login again.");
        logout();
      }
    }
    setIsReady(true);
  }, []);

  const login = (token) => {
    localStorage.setItem("token", token);
    setAuthToken(token);
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUser({
        id: payload.id,
        email: payload.sub,
        role: payload.role,
        token,
      });
    } catch (err) {
      alert("Login failed. Invalid token.");
      setUser(null);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setAuthToken(null);
    setUser(null);
  };

  if (!isReady) return null; // or a spinner component

  return (
    <AuthContext.Provider
      value={{ user, setUser, login, logout, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
