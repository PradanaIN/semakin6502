import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  showSuccess,
  showError,
  confirmDelete,
} from "../../utils/alerts";
import { Plus, Eye, Pencil, Trash2 } from "lucide-react";
import Table from "../../components/ui/Table";
import tableStyles from "../../components/ui/Table.module.css";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Label from "../../components/ui/Label";
import Select from "react-select";
import selectStyles from "../../utils/selectStyles";
import { STATUS } from "../../utils/status";
import Modal from "../../components/ui/Modal";
import StatusBadge from "../../components/ui/StatusBadge";
import SearchInput from "../../components/SearchInput";
import months from "../../utils/months";
import Pagination from "../../components/Pagination";


export default function KegiatanTambahanPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [kegiatan, setKegiatan] = useState([]);
  const [form, setForm] = useState({
    kegiatanId: "",
    tanggal: new Date().toISOString().slice(0, 10),
    status: STATUS.BELUM,
    deskripsi: "",
  });
  const [search, setSearch] = useState("");
  const [filterBulan, setFilterBulan] = useState("");
  const [filterTahun, setFilterTahun] = useState(new Date().getFullYear());
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tRes, kRes] = await Promise.all([
        axios.get("/kegiatan-tambahan"),
        axios.get("/master-kegiatan?limit=1000"),
      ]);
      setItems(tRes.data);
      setKegiatan(kRes.data.data || kRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({
      kegiatanId: "",
      tanggal: new Date().toISOString().slice(0, 10),
      status: STATUS.BELUM,
      deskripsi: "",
    });
    setShowForm(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      kegiatanId: item.kegiatanId,
      tanggal: item.tanggal.slice(0, 10),
      status: item.status,
      deskripsi: item.deskripsi || "",
    });
    setShowForm(true);
  };

  const save = async () => {
    if (!form.kegiatanId || !form.tanggal) return;
    try {
      const payload = { ...form };
      Object.keys(payload).forEach((k) => {
        if (payload[k] === "") delete payload[k];
      });
      if (editing) {
        await axios.put(`/kegiatan-tambahan/${editing.id}`, payload);
      } else {
        await axios.post("/kegiatan-tambahan", payload);
      }
      setShowForm(false);
      setEditing(null);
      fetchData();
      showSuccess("Berhasil", "Data disimpan");
    } catch (err) {
      console.error(err);
      showError("Error", "Gagal menyimpan");
    }
  };

  const remove = async (item) => {
    const r = await confirmDelete("Hapus kegiatan ini?");
    if (!r.isConfirmed) return;
    try {
      await axios.delete(`/kegiatan-tambahan/${item.id}`);
      fetchData();
      showSuccess("Dihapus", "Kegiatan dihapus");
    } catch (err) {
      console.error(err);
      showError("Error", "Gagal menghapus");
    }
  };

  const openDetail = (id) => {
    navigate(`/kegiatan-tambahan/${id}`);
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const text = `${item.nama} ${item.kegiatan?.team?.nama_tim || ""}`.toLowerCase();
      const matchesSearch = text.includes(search.toLowerCase());
      const date = new Date(item.tanggal);
      const bulan = date.getMonth() + 1;
      const tahun = date.getFullYear();
      const matchBulan = filterBulan ? bulan === parseInt(filterBulan, 10) : true;
      const matchTahun = filterTahun ? tahun === parseInt(filterTahun, 10) : true;
      return matchesSearch && matchBulan && matchTahun;
    });
  }, [items, search, filterBulan, filterTahun]);

  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const totalPages = Math.ceil(filteredItems.length / pageSize) || 1;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Kegiatan Tambahan</h1>
        <Button onClick={openCreate} className="add-button">
          <Plus size={16} /> Tambah
        </Button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari kegiatan..."
          ariaLabel="Cari kegiatan"
        />
        <select
          value={filterBulan}
          onChange={(e) => setFilterBulan(e.target.value)}
          className="border rounded px-2 py-[4px] bg-white dark:bg-gray-700 dark:text-gray-200"
        >
          <option value="">Bulan</option>
          {months.map((m, i) => (
            <option key={i + 1} value={i + 1}>
              {m}
            </option>
          ))}
        </select>
        <input
          type="number"
          value={filterTahun}
          onChange={(e) => setFilterTahun(parseInt(e.target.value, 10))}
          className="form-input w-24"
        />
      </div>

      <Table>
        <thead>
          <tr className={tableStyles.headerRow}>
            <th className={tableStyles.cell}>No</th>
            <th className={tableStyles.cell}>Nama</th>
            <th className={tableStyles.cell}>Tim</th>
            <th className={tableStyles.cell}>Tanggal</th>
            <th className={tableStyles.cell}>Status</th>
            <th className={tableStyles.cell}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="5" className="py-4 text-center">
                Memuat data...
              </td>
            </tr>
          ) : paginatedItems.length === 0 ? (
            <tr>
              <td colSpan="5" className="py-4 text-center">
                Data tidak ditemukan
              </td>
            </tr>
          ) : (
            paginatedItems.map((item, idx) => (
              <tr key={item.id} className="border-t dark:border-gray-700 text-center">
                <td className={tableStyles.cell}>{(currentPage - 1) * pageSize + idx + 1}</td>
                <td className={tableStyles.cell}>{item.nama}</td>
                <td className={tableStyles.cell}>{item.kegiatan.team?.nama_tim || '-'}</td>
                <td className={tableStyles.cell}>{item.tanggal.slice(0,10)}</td>
                <td className={tableStyles.cell}>
                  <StatusBadge status={item.status} />
                </td>
                <td className={`${tableStyles.cell} space-x-2`}>
                  <Button
                    onClick={() => openDetail(item.id)}
                    icon
                    aria-label="Detail"
                  >
                    <Eye size={16} />
                  </Button>
                  <Button
                    onClick={() => openEdit(item)}
                    variant="warning"
                    icon
                    aria-label="Edit"
                  >
                    <Pencil size={16} />
                  </Button>
                  <Button
                    onClick={() => remove(item)}
                    variant="danger"
                    icon
                    aria-label="Hapus"
                  >
                    <Trash2 size={16} />
                  </Button>
                </td>
              </tr>
          ))
          )}
        </tbody>
      </Table>

      <div className="flex items-center justify-between mt-4">
        <div className="space-x-2">
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(parseInt(e.target.value, 10));
              setCurrentPage(1);
            }}
            className="border rounded px-3 py-2 bg-white text-gray-900 dark:bg-gray-700 dark:text-gray-200"
          >
            {[5, 10, 25].map((n) => (
              <option key={n} value={n} className="text-gray-900 dark:text-gray-200">
                {n}
              </option>
            ))}
          </select>
        </div>
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>

      {showForm && (
        <Modal
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
          titleId="kegiatan-tambahan-modal-title"
        >
          <h2 id="kegiatan-tambahan-modal-title" className="text-xl font-semibold mb-2">
            {editing ? "Edit Kegiatan" : "Tambah Kegiatan"}
          </h2>
          <div className="space-y-2">
            <div>
              <Label htmlFor="kegiatan">Kegiatan</Label>
              <Select
                inputId="kegiatan"
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
                <Label htmlFor="tanggal">Tanggal</Label>
                <Input
                  id="tanggal"
                  type="date"
                  value={form.tanggal}
                  onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
                  className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700"
                />
              </div>
              <div>
                <Label htmlFor="deskripsi">Deskripsi</Label>
                <textarea
                  id="deskripsi"
                  value={form.deskripsi}
                  onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                  className="form-input"
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700"
                >
                  <option value={STATUS.BELUM}>{STATUS.BELUM}</option>
                  <option value={STATUS.SEDANG_DIKERJAKAN}>
                    {STATUS.SEDANG_DIKERJAKAN}
                  </option>
                  <option value={STATUS.SELESAI_DIKERJAKAN}>
                    {STATUS.SELESAI_DIKERJAKAN}
                  </option>
                </select>
              </div>
            <div className="flex justify-end space-x-2 pt-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowForm(false);
                  setEditing(null);
                }}
              >
                Batal
              </Button>
              <Button onClick={save}>Simpan</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
