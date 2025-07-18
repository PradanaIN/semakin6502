/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
} from "react";
import axios from "axios";
import camelizeKeys from "../../utils/camelizeKeys.js";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem("user");
    return u ? camelizeKeys(JSON.parse(u)) : null;
  });

  const verifyToken = async () => {
    try {
      const res = await axios.get("/auth/me");
      const userData = camelizeKeys(res.data.user);
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    } catch {
      localStorage.removeItem("user");
      setUser(null);
    }
  };

  useEffect(() => {
    verifyToken();
  }, []);

  const value = useMemo(
    () => ({ user, setUser }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
