import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../auth/useAuth";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Label from "../../components/ui/Label";
import { showSuccess, showWarning, handleAxiosError } from "../../utils/alerts";
import { User } from "lucide-react";
import Spinner from "../../components/Spinner";

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
      <div className="p-6 text-center">
        <Spinner className="h-6 w-6 mx-auto" />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-900 rounded-xl shadow-md space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <User className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Profil Saya
        </h2>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="nama">Nama</Label>
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
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={save} disabled={loading} className="w-full sm:w-auto">
          {loading ? "Menyimpan..." : "Simpan Perubahan"}
        </Button>
      </div>
    </div>
  );
}
