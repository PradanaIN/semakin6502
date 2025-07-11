import { useState } from "react";
import LoginPage from "./pages/auth/LoginPage";
import Dashboard from "./pages/dashboard/Dashboard";

export default function App() {
  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);

  if (!token) {
    return <LoginPage setToken={setToken} setUser={setUser} />;
  }

  return <Dashboard user={user} setToken={setToken} />;
}
