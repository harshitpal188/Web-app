import { createContext, useContext, useEffect, useMemo, useState } from "react";
import axiosClient from "../api/axiosClient";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (payload) => {
    const { data } = await axiosClient.post("/auth/login", payload);
    localStorage.setItem("token", data.token);
    setUser(data.user);
    return data;
  };

  const signup = async (payload) => {
    const { data } = await axiosClient.post("/auth/signup", payload);
    localStorage.setItem("token", data.token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const fetchMe = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }
      const { data } = await axiosClient.get("/auth/me");
      setUser(data.user);
    } catch (error) {
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      signup,
      logout,
      isAuthenticated: !!user,
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
