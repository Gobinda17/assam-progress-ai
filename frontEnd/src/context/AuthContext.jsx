import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

const AuthContext = createContext();

axios.defaults.withCredentials = true;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedAuth = localStorage.getItem("isAuthenticated");
    if (storedUser && storedAuth === "true") {
      try {
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem("user");
        localStorage.removeItem("isAuthenticated");
      }
    }
    setIsLoading(false);
  }, []);

  const saverUser = (userData) => {
    setUser(userData);
    setIsAuthenticated(!!userData);

    if (userData) {
      const safeUserData = {
        name: userData.name,
        email: userData.email,
        role: userData.role,
      };
      localStorage.setItem("user", JSON.stringify(safeUserData));
      localStorage.setItem("isAuthenticated", "true");
    } else {
      localStorage.removeItem("user");
      localStorage.removeItem("isAuthenticated");
    }
  };

  const register = async (name, email, password) => {
    try {
      const resp = await axios.post(`${API_URL}/auth/register`, {
        name,
        email,
        password,
      });
      if (resp?.data?.user) {
        saverUser(resp.data.user);
      }
      return resp;
    } catch (err) {
      throw err;
    }
  };

  const login = async (email, password) => {
    try {
      const resp = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });
      if (resp?.data?.user) {
        saverUser(resp.data.user);
      }
      return resp;
    } catch (err) {
      throw err;
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    register,
    saverUser,
    login,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("UseAuth must be used within an AuthProvider");
  }
  return ctx;
};
