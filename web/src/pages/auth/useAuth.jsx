/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";
import camelizeKeys from "../../utils/camelizeKeys.js";

const AuthContext = createContext();

export function safeParseUser(userString) {
  if (!userString) return null;
  try {
    return camelizeKeys(JSON.parse(userString));
  } catch {
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const u =
      localStorage.getItem("user") || sessionStorage.getItem("user");
    return safeParseUser(u);
  });

  const verifyToken = useCallback(async () => {
    try {
      const res = await axios.get("/auth/me");
      const rawUser = res.data.user;
      const isValidUser =
        rawUser && typeof rawUser === "object" && !Array.isArray(rawUser);

      if (isValidUser) {
        const userData = camelizeKeys(rawUser);
        setUser(userData);
        const storage =
          localStorage.getItem("user") !== null ? localStorage : sessionStorage;
        storage.setItem("user", JSON.stringify(userData));
      } else {
        localStorage.removeItem("user");
        sessionStorage.removeItem("user");
        setUser(null);
      }
    } catch {
      localStorage.removeItem("user");
      sessionStorage.removeItem("user");
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const hasUser =
      localStorage.getItem("user") || sessionStorage.getItem("user");
    const isLoginPage = window.location.pathname === "/login";
    if (hasUser || !isLoginPage) {
      verifyToken();
    }
  }, [verifyToken]);

  const value = useMemo(
    () => ({ user, setUser }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
