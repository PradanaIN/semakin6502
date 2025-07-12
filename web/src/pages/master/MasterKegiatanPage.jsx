import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useAuth } from "../auth/useAuth";

export default function MasterKegiatanPage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [teams, setTeams] = useState([]);
  const [form, setForm] = useState({ teamId: "", nama_kegiatan: "" });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchItems();
    fetchTeams();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await axios.get("/master-kegiatan");
      setItems(res.data);
    } catch (err) {
      console.error("Gagal mengambil master kegiatan", err);
    }
  };

  const fetchTeams = async () => {
    try {
      const res = await axios.get("/teams");
      setTeams(res.data);
    } catch (err) {
      console.error("Gagal mengambil tim", err);
    }
  };

  const openCreate = () => {
    setForm({ teamId: "", nama_kegiatan: "" });
    setShowForm(true);
  };

  const saveItem = async () => {
    try {
      await axios.post("/master-kegiatan", form);
      setShowForm(false);
      fetchItems();
      Swal.fire("Berhasil", "Kegiatan disimpan", "success");
    } catch (err) {
      console.error("Gagal menyimpan kegiatan", err);
    }
  };

  if (user?.role !== "ketua") {
    return (
      <div className="p-6 text-center">Anda tidak memiliki akses ke halaman ini.</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Master Kegiatan</h1>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
        >
          Tambah Kegiatan
        </button>
      </div>

      <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow">
        <thead>
          <tr className="bg-gray-200 dark:bg-gray-700 text-left text-sm uppercase">
            <th className="px-4 py-2">ID</th>
            <th className="px-4 py-2">Tim</th>
            <th className="px-4 py-2">Nama Kegiatan</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-t dark:border-gray-700">
              <td className="px-4 py-2">{item.id}</td>
              <td className="px-4 py-2">{item.team?.nama_tim || item.teamId}</td>
              <td className="px-4 py-2">{item.nama_kegiatan}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md space-y-4 shadow-xl">
            <h2 className="text-xl font-semibold mb-2">Tambah Kegiatan</h2>
            <div className="space-y-2">
              <div>
                <label className="block text-sm mb-1">Tim</label>
                <select
                  value={form.teamId}
                  onChange={(e) => setForm({ ...form, teamId: parseInt(e.target.value, 10) })}
                  className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700"
                >
                  <option value="">Pilih tim</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nama_tim}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">Nama Kegiatan</label>
                <input
                  type="text"
                  value={form.nama_kegiatan}
                  onChange={(e) => setForm({ ...form, nama_kegiatan: e.target.value })}
                  className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded"
              >
                Batal
              </button>
              <button
                onClick={saveItem}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
