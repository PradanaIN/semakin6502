import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../auth/useAuth";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Label from "../../components/ui/Label";
import { showSuccess, showWarning, handleAxiosError } from "../../utils/alerts";

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({ nama: "", email: "", password: "" });

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
      const res = await axios.put("/users/profile", form);
      const updated = res.data;
      setUser(updated);
      localStorage.setItem("user", JSON.stringify(updated));
      setForm({ ...form, password: "" });
      showSuccess("Berhasil", "Profil diperbarui");
    } catch (err) {
      handleAxiosError(err, "Gagal menyimpan profil");
    }
  };

  if (!user) {
    return <div className="p-6 text-center">Memuat...</div>;
  }

  return (
    <div className="max-w-md mx-auto p-4 space-y-4">
      <h2 className="text-xl font-semibold">Profil Saya</h2>
      <div>
        <Label htmlFor="nama">Nama</Label>
        <Input
          id="nama"
          type="text"
          value={form.nama}
          onChange={(e) => setForm({ ...form, nama: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="password">Password Baru</Label>
        <Input
          id="password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
      </div>
      <div className="flex justify-end">
        <Button onClick={save}>Simpan</Button>
      </div>
    </div>
  );
}
