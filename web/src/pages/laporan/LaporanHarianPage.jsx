import { useEffect, useState } from "react";
import axios from "axios";
import { Pencil, Trash2 } from "lucide-react";
import { showSuccess, showError, confirmDelete } from "../../utils/alerts";
import Pagination from "../../components/Pagination";
import Modal from "../../components/ui/Modal";
import Table from "../../components/ui/Table";
import tableStyles from "../../components/ui/Table.module.css";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Label from "../../components/ui/Label";
import { STATUS } from "../../utils/status";
import StatusBadge from "../../components/ui/StatusBadge";
import SearchInput from "../../components/SearchInput";

export default function LaporanHarianPage() {
  const [laporan, setLaporan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    id: null,
    tanggal: new Date().toISOString().slice(0, 10),
    status: STATUS.BELUM,
    bukti_link: "",
    catatan: "",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/laporan-harian/mine");
      setLaporan(res.data);
    } catch (err) {
      console.error("Gagal mengambil laporan", err);
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (item) => {
    setForm({
      id: item.id,
      tanggal: item.tanggal.slice(0, 10),
      status: item.status,
      bukti_link: item.bukti_link || "",
      catatan: item.catatan || "",
    });
    setShowForm(true);
  };

  const saveForm = async () => {
    try {
      if (form.id) {
        await axios.put(`/laporan-harian/${form.id}`, form);
      }
      setShowForm(false);
      fetchData();
      showSuccess("Berhasil", "Laporan diperbarui");
    } catch (err) {
      console.error(err);
      showError("Error", "Gagal menyimpan");
    }
  };

  const remove = async (id) => {
    const r = await confirmDelete("Hapus laporan ini?");
    if (!r.isConfirmed) return;
    try {
      await axios.delete(`/laporan-harian/${id}`);
      fetchData();
      showSuccess("Dihapus", "Laporan dihapus");
    } catch (err) {
      console.error(err);
      showError("Error", "Gagal menghapus");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = laporan.filter((l) => {
    const peg = l.pegawai?.nama?.toLowerCase() || "";
    const keg = l.penugasan?.kegiatan?.nama_kegiatan?.toLowerCase() || "";
    const cat = l.catatan?.toLowerCase() || "";
    const stat = l.status.toLowerCase();
    const txt = `${peg} ${keg} ${cat} ${stat}`;
    const matchQuery = txt.includes(query.toLowerCase());
    const matchDate = l.tanggal.slice(0, 10) === tanggal;
    return matchQuery && matchDate;
  });
  const paginated = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-2">
        <SearchInput
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Cari..."
          ariaLabel="Cari"
        />

        <div>
          <input
            id="filterTanggal"
            type="date"
            value={tanggal}
            onChange={(e) => {
              setTanggal(e.target.value);
              setCurrentPage(1);
            }}
            className="form-input border rounded px-2 py-[3px] bg-white dark:bg-gray-700 dark:text-gray-200 text-center"
          />
        </div>
      </div>
      {loading ? (
        <div>Memuat...</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <Table>
              <thead>
                <tr className={tableStyles.headerRow}>
                  <th className={tableStyles.cell}>No</th>
                  <th className={tableStyles.cell}>Kegiatan</th>
                  <th className={tableStyles.cell}>Tim</th>
                  <th className={tableStyles.cell}>Deskripsi</th>
                  <th className={tableStyles.cell}>Tanggal</th>
                  <th className={tableStyles.cell}>Status</th>
                  <th className={tableStyles.cell}>Bukti</th>
                  <th className={tableStyles.cell}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((item, idx) => (
                  <tr
                    key={item.id}
                    className={`${tableStyles.row} border-t dark:border-gray-700 text-center`}
                  >
                    <td className={tableStyles.cell}>
                      {(currentPage - 1) * pageSize + idx + 1}
                    </td>
                    <td className={tableStyles.cell}>
                      {item.penugasan?.kegiatan?.nama_kegiatan || "-"}
                    </td>
                    <td className={tableStyles.cell}>
                      {item.penugasan?.tim?.nama_tim || "-"}
                    </td>
                    <td className={tableStyles.cell}>
                      {item.penugasan?.kegiatan?.deskripsi || "-"}
                    </td>
                    <td className={tableStyles.cell}>
                      {item.tanggal.slice(0, 10)}
                    </td>
                    <td className={tableStyles.cell}>
                      <StatusBadge status={item.status} />
                    </td>
                    <td className={tableStyles.cell}>
                      {item.bukti_dukung ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <X className="w-4 h-4 text-red-600" />
                      )}
                    </td>
                    <td className={tableStyles.cell}>{item.catatan || "-"}</td>
                    <td className={`${tableStyles.cell} space-x-1`}>
                      <Button
                        onClick={() => openEdit(item)}
                        variant="warning"
                        icon
                        aria-label="Edit"
                      >
                        <Pencil size={14} />
                      </Button>
                      <Button
                        onClick={() => remove(item.id)}
                        variant="danger"
                        icon
                        aria-label="Hapus"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </td>
                  </tr>
                ))}
                {laporan.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="text-center py-4 text-gray-500 dark:text-gray-400"
                    >
                      Tidak ada laporan
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
            <div className="flex items-center justify-between mt-2">
              <div className="space-x-2">
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(parseInt(e.target.value, 10));
                    setCurrentPage(1);
                  }}
                  className="border rounded px-3 py-1 bg-white dark:bg-gray-700 dark:text-gray-200"
                >
                  {[5, 10, 25].map((n) => (
                    <option
                      key={n}
                      value={n}
                      className="text-gray-900 dark:text-gray-200"
                    >
                      {n}
                    </option>
                  ))}
                </select>
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        </>
      )}
      {showForm && (
        <Modal
          onClose={() => {
            setShowForm(false);
          }}
          titleId="laporan-harian-form-title"
        >
          <h3 id="laporan-harian-form-title" className="text-lg font-semibold">
            Edit Laporan Harian
          </h3>
          <div className="space-y-2">
            <div>
              <Label htmlFor="tanggal">
                Tanggal<span className="text-red-500">*</span>
              </Label>
              <Input
                id="tanggal"
                type="date"
                value={form.tanggal}
                onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
                className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700"
              />
            </div>
            <div>
              <Label htmlFor="status">
                Status<span className="text-red-500">*</span>
              </Label>
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
            {form.status === STATUS.SELESAI_DIKERJAKAN && (
              <div>
                <Label htmlFor="bukti_link">Link Bukti</Label>
                <Input
                  id="bukti_link"
                  type="text"
                  value={form.bukti_link}
                  onChange={(e) =>
                    setForm({ ...form, bukti_link: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700"
                />
              </div>
            )}
            <div>
              <Label htmlFor="catatan">Catatan</Label>
              <textarea
                id="catatan"
                value={form.catatan}
                onChange={(e) => setForm({ ...form, catatan: e.target.value })}
                className="form-input"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="secondary" onClick={() => setShowForm(false)}>
              Batal
            </Button>
            <Button onClick={saveForm}>Simpan</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
