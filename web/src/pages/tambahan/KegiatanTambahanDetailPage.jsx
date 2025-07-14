import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { Pencil, Trash2 } from "lucide-react";
import Select from "react-select";

const selectStyles = {
  option: (base) => ({ ...base, color: "#000" }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
};

export default function KegiatanTambahanDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [editing, setEditing] = useState(false);
  const [kegiatan, setKegiatan] = useState([]);
  const [laporanForm, setLaporanForm] = useState({
    tanggal_selesai: "",
    tanggal_selesai_akhir: "",
    bukti_link: "",
    status: "Selesai Dikerjakan",
  });
  const [form, setForm] = useState({
    kegiatanId: "",
    tanggal: "",
    status: "Belum",
    deskripsi: "",
  });

  const fetchDetail = async () => {
    try {
      const [dRes, kRes] = await Promise.all([
        axios.get(`/kegiatan-tambahan/${id}`),
        axios.get("/master-kegiatan?limit=1000"),
      ]);
      setItem(dRes.data);
      setKegiatan(kRes.data.data || kRes.data);
      setForm({
        kegiatanId: dRes.data.kegiatanId,
        tanggal: dRes.data.tanggal.slice(0, 10),
        status: dRes.data.status,
        deskripsi: dRes.data.deskripsi || "",
      });
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Gagal mengambil data", "error");
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const save = async () => {
    try {
      const payload = { ...form };
      Object.keys(payload).forEach((k) => {
        if (payload[k] === "") delete payload[k];
      });
      await axios.put(`/kegiatan-tambahan/${id}`, payload);
      Swal.fire("Berhasil", "Kegiatan diperbarui", "success");
      setEditing(false);
      fetchDetail();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Gagal menyimpan", "error");
    }
  };

  const addLaporan = async () => {
    try {
      const payload = { ...laporanForm };
      Object.keys(payload).forEach((k) => {
        if (payload[k] === "") delete payload[k];
      });
      await axios.put(`/kegiatan-tambahan/${id}`, payload);
      Swal.fire("Berhasil", "Laporan ditambah", "success");
      setLaporanForm({
        tanggal_selesai: "",
        tanggal_selesai_akhir: "",
        bukti_link: "",
        status: "Selesai Dikerjakan",
      });
      fetchDetail();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Gagal menambah laporan", "error");
    }
  };

  const remove = async () => {
    const r = await Swal.fire({
      title: "Hapus kegiatan ini?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Hapus",
    });
    if (!r.isConfirmed) return;
    try {
      await axios.delete(`/kegiatan-tambahan/${id}`);
      Swal.fire("Dihapus", "Kegiatan dihapus", "success");
      navigate(-1);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Gagal menghapus", "error");
    }
  };

  if (!item) return <div className="p-6">Memuat...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Detail Kegiatan Tambahan</h2>
        {!editing && (
          <div className="space-x-2">
            <button
              onClick={() => setEditing(true)}
              className="p-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={remove}
              className="p-2 bg-red-600 hover:bg-red-700 text-white rounded"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>
      {!editing ? (
        <div className="space-y-2 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div>
            <div className="text-sm text-gray-500">Nama</div>
            <div className="font-medium">{item.nama}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Tim</div>
            <div className="font-medium">{item.kegiatan.team?.nama_tim || "-"}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Tanggal</div>
            <div className="font-medium">{item.tanggal.slice(0, 10)}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Deskripsi</div>
            <div className="font-medium">{item.deskripsi || "-"}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Status</div>
            <div className="font-medium">{item.status}</div>
          </div>
          {item.tanggal_selesai && (
            <div>
              <div className="text-sm text-gray-500">Tanggal Selesai</div>
              <div className="font-medium">
                {item.tanggal_selesai.slice(0, 10)}
                {item.tanggal_selesai_akhir &&
                  ` - ${item.tanggal_selesai_akhir.slice(0, 10)}`}
              </div>
            </div>
          )}
          {item.bukti_link && (
            <div>
              <div className="text-sm text-gray-500">Bukti</div>
              <a
                href={item.bukti_link}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 underline"
              >
                Link
              </a>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div>
            <label className="block text-sm mb-1">Kegiatan</label>
            <Select
              classNamePrefix="react-select"
              styles={selectStyles}
              menuPortalTarget={document.body}
              options={kegiatan.map((k) => ({ value: k.id, label: k.nama_kegiatan }))}
              value={
                form.kegiatanId
                  ? { value: form.kegiatanId, label: kegiatan.find((k) => k.id === form.kegiatanId)?.nama_kegiatan }
                  : null
              }
              onChange={(o) => setForm({ ...form, kegiatanId: o ? parseInt(o.value, 10) : "" })}
              placeholder="Pilih kegiatan..."
            />
            {form.kegiatanId && (
              <p className="text-sm mt-1 text-gray-600 dark:text-gray-300">
                Tim: {kegiatan.find((k) => k.id === form.kegiatanId)?.team?.nama_tim || "-"}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm mb-1">Tanggal</label>
            <input
              type="date"
              value={form.tanggal}
              onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
              className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Deskripsi</label>
            <textarea
              value={form.deskripsi}
              onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
              className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700"
            >
              <option value="Belum">Belum</option>
              <option value="Sedang Dikerjakan">Sedang Dikerjakan</option>
              <option value="Selesai Dikerjakan">Selesai Dikerjakan</option>
            </select>
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <button
              onClick={() => setEditing(false)}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded"
            >
              Batal
            </button>
            <button
              onClick={save}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
            >
              Simpan
            </button>
          </div>
        </div>
      )}
      <div className="space-y-2 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold">Bukti / Laporan Selesai</h3>
        <div className="space-y-2">
          <div>
            <label className="block text-sm mb-1">Tanggal Mulai</label>
            <input
              type="date"
              value={laporanForm.tanggal_selesai}
              onChange={(e) =>
                setLaporanForm({ ...laporanForm, tanggal_selesai: e.target.value })
              }
              className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Tanggal Akhir</label>
            <input
              type="date"
              value={laporanForm.tanggal_selesai_akhir}
              onChange={(e) =>
                setLaporanForm({ ...laporanForm, tanggal_selesai_akhir: e.target.value })
              }
              className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Link Bukti</label>
            <input
              type="text"
              value={laporanForm.bukti_link}
              onChange={(e) =>
                setLaporanForm({ ...laporanForm, bukti_link: e.target.value })
              }
              className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700"
            />
          </div>
        </div>
        <div className="flex justify-end pt-2">
          <button
            onClick={addLaporan}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            Simpan Bukti
          </button>
        </div>
      </div>
    </div>
  );
}
