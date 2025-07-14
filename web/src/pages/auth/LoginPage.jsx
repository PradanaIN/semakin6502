import { useState } from "react";
import axios from "axios";
import { useAuth } from "./useAuth";
import Button from "../../components/ui/Button";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { setToken, setUser } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        form
      );

      setToken(res.data.access_token);
      setUser(res.data.user);

      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      setError("");
      navigate("/dashboard");
    } catch (err) {
      console.error("Login failed:", err?.response?.data || err.message);
      setError("Login gagal. Periksa data login Anda.");

      // hanya kosongkan password
      setForm((prev) => ({ ...prev, password: "" }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-200 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 p-4">
      <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md shadow-xl rounded-2xl ring-1 ring-zinc-200 dark:ring-zinc-800 w-full max-w-md p-8 space-y-6">
        <h1 className="text-2xl font-bold text-center text-zinc-800 dark:text-white">
          SEMAKIN 6502
        </h1>
        <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
          Masuk untuk melanjutkan
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
          className="space-y-4"
        >
          <div>
            <label htmlFor="identifier" className="block text-sm text-zinc-700 dark:text-zinc-300 mb-1">
              Email atau Username
            </label>
            <input
              id="identifier"
              type="text"
              placeholder="Email atau Username"
              value={form.identifier ?? ""}
              onChange={(e) => setForm({ ...form, identifier: e.target.value })}
              className="form-input"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm text-zinc-700 dark:text-zinc-300 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="********"
                value={form.password ?? ""}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="form-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-zinc-500 dark:text-zinc-400"
                title={showPassword ? "Sembunyikan" : "Lihat Password"}
                aria-label={showPassword ? "Sembunyikan" : "Lihat Password"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <Button type="submit" className="w-full font-semibold">
            Login
          </Button>
        </form>

        <p className="text-xs text-zinc-400 text-center">
          &copy; 2025 Badan Pusat Statistik Kabupaten Bulungan
        </p>
      </div>
    </div>
  );
}
