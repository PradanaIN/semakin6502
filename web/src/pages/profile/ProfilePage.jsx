import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../auth/useAuth";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Label from "../../components/ui/Label";
import Skeleton from "../../components/ui/Skeleton";
import Spinner from "../../components/Spinner";
import { showSuccess, showWarning, handleAxiosError } from "../../utils/alerts";
import { User, Save } from "lucide-react";

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    nama: "",
    username: "",
    email: "",
    phone: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        nama: user.nama || "",
        username: user.username || "",
        email: user.email || "",
        phone: user.phone || "",
        password: "",
      });
    }
  }, [user]);

  const save = async () => {
    // Normalisasi nilai untuk validasi dan payload
    const nama = (form.nama || "").trim();
    const username = (form.username || "").trim();
    const email = (form.email || "").trim();
    const phone = (form.phone || "").trim();
    const password = form.password || "";

    // Validasi sederhana dan set error per-kolom
    const newErrors = {};
    if (!nama) newErrors.nama = "Nama lengkap wajib diisi";
    if (!username) {
      newErrors.username = "Username wajib diisi";
    } else {
      const usernameOk = /^[a-zA-Z0-9._]{3,30}$/.test(username);
      if (!usernameOk)
        newErrors.username =
          "Username minimal 3 karakter, hanya huruf/angka/titik/garis bawah";
    }
    if (!email) newErrors.email = "Email wajib diisi";
    if (!phone) newErrors.phone = "Nomor WhatsApp wajib diisi";
    if (password && password.length < 6) {
      newErrors.password = "Password minimal 6 karakter";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      showWarning("Lengkapi data", "Periksa kembali input yang ditandai");
      return;
    }

    // Susun payload: jangan kirim password jika kosong (hindari validasi backend)
    const payload = { nama, email, phone, username };
    if (password) payload.password = password;

    try {
      setLoading(true);
      const res = await axios.put("/users/profile", payload);
      const updated = res.data;
      setUser(updated);
      localStorage.setItem("user", JSON.stringify(updated));
      setForm({ ...form, password: "" });
      setErrors({});
      showSuccess("Berhasil", "Profil diperbarui");
    } catch (err) {
      // Jika backend mengembalikan error password, tampilkan inline
      const msg = err?.response?.data?.message || err?.message || "";
      if (msg && /password/i.test(msg) && /6|six/i.test(msg)) {
        setErrors((prev) => ({
          ...prev,
          password: "Password minimal 6 karakter",
        }));
      }
      handleAxiosError(err, "Gagal menyimpan profil");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="p-6 text-center text-gray-500">
        <Skeleton className="mx-auto h-4 w-40" />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-6 sm:p-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-md dark:shadow-lg space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <User className="w-6 h-6 text-blue-600" />
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            Profil Saya
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Perbarui informasi akun Anda di sini.
          </p>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
        className="space-y-5"
      >
        <div>
          <Label htmlFor="nama">
            Nama Lengkap <span className="text-red-500">*</span>
          </Label>
          <Input
            id="nama"
            type="text"
            placeholder="Nama lengkap"
            value={form.nama}
            aria-required="true"
            aria-invalid={!!errors.nama}
            aria-describedby={errors.nama ? "nama-error" : undefined}
            onBlur={() => {
              if (!form.nama)
                setErrors((prev) => ({
                  ...prev,
                  nama: "Nama lengkap wajib diisi",
                }));
            }}
            onChange={(e) => {
              const v = e.target.value;
              setForm({ ...form, nama: v });
              if (v) setErrors((prev) => ({ ...prev, nama: undefined }));
            }}
          />
          {errors.nama && (
            <p id="nama-error" className="mt-1 text-xs text-red-600">
              {errors.nama}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="username">
            Username <span className="text-red-500">*</span>
          </Label>
          <Input
            id="username"
            type="text"
            placeholder="Misal: bps.bulungan"
            value={form.username}
            aria-required="true"
            aria-invalid={!!errors.username}
            aria-describedby={
              errors.username ? "username-error" : "username-help"
            }
            autoComplete="username"
            onBlur={() => {
              const v = (form.username || "").trim();
              if (!v) {
                setErrors((prev) => ({
                  ...prev,
                  username: "Username wajib diisi",
                }));
              } else if (!/^[a-zA-Z0-9._]{3,30}$/.test(v)) {
                setErrors((prev) => ({
                  ...prev,
                  username:
                    "Username minimal 3 karakter, hanya huruf/angka/titik/garis bawah",
                }));
              }
            }}
            onChange={(e) => {
              const v = e.target.value;
              setForm({ ...form, username: v });
              if (v && /^[a-zA-Z0-9._]{3,30}$/.test(v)) {
                setErrors((prev) => ({ ...prev, username: undefined }));
              }
            }}
          />
          {!errors.username && (
            <p
              id="username-help"
              className="mt-1 text-xs text-gray-500 dark:text-gray-400"
            >
              Wajib. 3-30 karakter, huruf/angka, boleh titik atau _.
            </p>
          )}
          {errors.username && (
            <p id="username-error" className="mt-1 text-xs text-red-600">
              {errors.username}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="email">
            Email <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="Alamat email aktif"
            value={form.email}
            aria-required="true"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : "email-help"}
            onBlur={() => {
              if (!form.email)
                setErrors((prev) => ({ ...prev, email: "Email wajib diisi" }));
            }}
            onChange={(e) => {
              const v = e.target.value;
              setForm({ ...form, email: v });
              if (v) setErrors((prev) => ({ ...prev, email: undefined }));
            }}
          />
          {!errors.email && (
            <p
              id="email-help"
              className="mt-1 text-xs text-gray-500 dark:text-gray-400"
            >
              Gunakan email yang valid dan aktif.
            </p>
          )}
          {errors.email && (
            <p id="email-error" className="mt-1 text-xs text-red-600">
              {errors.email}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="phone">
            Nomor WhatsApp <span className="text-red-500">*</span>
          </Label>
          <Input
            id="phone"
            type="text"
            placeholder="Nomor WhatsApp aktif"
            value={form.phone}
            aria-required="true"
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? "phone-error" : "phone-help"}
            onBlur={() => {
              if (!form.phone)
                setErrors((prev) => ({
                  ...prev,
                  phone: "Nomor WhatsApp wajib diisi",
                }));
            }}
            onChange={(e) => {
              const v = e.target.value;
              setForm({ ...form, phone: v });
              if (v) setErrors((prev) => ({ ...prev, phone: undefined }));
            }}
          />
          {!errors.phone && (
            <p
              id="phone-help"
              className="mt-1 text-xs text-gray-500 dark:text-gray-400"
            >
              Format: 62xxxxxxxxxx. Pastikan nomor dapat dihubungi.
            </p>
          )}
          {errors.phone && (
            <p id="phone-error" className="mt-1 text-xs text-red-600">
              {errors.phone}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="password">Password Baru</Label>
          <Input
            id="password"
            type="password"
            placeholder="Opsional - isi jika ingin mengganti"
            value={form.password}
            aria-invalid={!!errors.password}
            aria-describedby={
              errors.password ? "password-error" : "password-help"
            }
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          {!errors.password && (
            <p
              id="password-help"
              className="mt-1 text-xs text-gray-500 dark:text-gray-400"
            >
              Opsional. Kosongkan jika tidak ingin mengubah. Minimal 6 karakter.
            </p>
          )}
          {errors.password && (
            <p id="password-error" className="mt-1 text-xs text-red-600">
              {errors.password}
            </p>
          )}
        </div>

        <div className="pt-2 flex sm:justify-end">
          <Button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Spinner className="w-4 h-4" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save size={16} />
                Simpan Perubahan
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
