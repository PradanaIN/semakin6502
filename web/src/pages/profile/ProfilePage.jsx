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
  const [form, setForm] = useState({ nama: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({ nama: user.nama || "", email: user.email || "", password: "" });
    }
  }, [user]);

  const save = async () => {
    if (!form.nama || !form.email) {
      showWarning("Lengkapi data", "Nama dan email wajib diisi");
      return;
    }
    try {
      setLoading(true);
      const res = await axios.put("/users/profile", form);
      const updated = res.data;
      setUser(updated);
      localStorage.setItem("user", JSON.stringify(updated));
      setForm({ ...form, password: "" });
      showSuccess("Berhasil", "Profil diperbarui");
    } catch (err) {
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
          <Label htmlFor="nama">Nama Lengkap</Label>
          <Input
            id="nama"
            type="text"
            placeholder="Nama lengkap"
            value={form.nama}
            onChange={(e) => setForm({ ...form, nama: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Alamat email aktif"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="password">Password Baru</Label>
          <Input
            id="password"
            type="password"
            placeholder="Opsional - isi jika ingin mengganti"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>

        <div className="pt-2">
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
