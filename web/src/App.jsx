import LoginPage from "./pages/auth/LoginPage";
import AppRoutes from "./routes/AppRoutes";
import { useAuth } from "./pages/auth/useAuth";

export default function App() {
  const { token, user } = useAuth();

  if (!token || !user) {
    return <LoginPage />;
  }

  return <AppRoutes />;
}
