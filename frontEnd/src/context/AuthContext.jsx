import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const API_URL = "/api";

const AuthContext = createContext();

axios.defaults.withCredentials = true;
axios.defaults.baseURL = "/api";

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
    refreshUser().finally(() => setIsLoading(false));
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

  const refreshUser = async () => {
    try {
      const res = await axios.post(`${API_URL}/auth/refresh`, { withCredentials: true });
      if (res.data?.user) {
        saverUser(res.data.user);
      } else {
        saverUser(null);
      }
    } catch (error) {
      saverUser(null);
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
      throw err?.response?.data?.message || err.message;
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${API_URL}/auth/logout`);
    } catch (err) {
      // ignore logout API failures and clear client auth state anyway
    } finally {
      saverUser(null);
    }
  };

  const updatePassword = async (currentPassword, newPassword) => {
    try {
      const res = await axios.post(`${API_URL}/auth/me/update-password`, {
        currentPassword,
        newPassword,
      });
      return res;

    } catch (err) {
      throw err;
    }
  };

  const userList = async () => {
    try {
      const res = await axios.get(`${API_URL}/auth/user-list`);
      if(res.data?.users) {
        return res.data.users;
      }
    } catch (err) {
      throw err;
    }
  }

  const roleUpdate = async (userId, newRole) => {
    try {
      const res = await axios.post(`${API_URL}/auth/update-role`, {
        userId,
        newRole,
      });
      if(res.data?.user) {
        return res.data.user;
      }
    } catch (err) {
      throw err;
    }
  }

  const statusUpdate = async (userId, newStatus) => {
    try {
      const res = await axios.post(`${API_URL}/auth/update-status`, {
        userId,
        newStatus,
      });
      if(res.data?.user) {
        return res.data.user;
      }
    } catch (err) {
      throw err;
    }
  }

  const deleteUser = async (userId) => {
    try {
      const res = await axios.delete(`${API_URL}/auth/user/${userId}`);
      return res.data;
    } catch (err) {
      throw err;
    }
  }

  const resetPassword = async (email, newPassword) => {
    try {
      const res = await axios.post(`${API_URL}/auth/reset-password`, {
        email,
        newPassword,
      });
      return res.data;
    } catch (err) {
      throw err;
    }
  }

  const value = {
    user,
    isAuthenticated,
    isLoading,
    register,
    saverUser,
    refreshUser,
    login,
    logout,
    updatePassword,
    userList,
    roleUpdate,
    statusUpdate,
    deleteUser,
    resetPassword,
    API_URL,
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
