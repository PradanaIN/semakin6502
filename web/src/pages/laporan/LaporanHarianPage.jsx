import { useEffect, useState } from "react";
import axios from "axios";
import { Pencil, Trash2, ExternalLink, X } from "lucide-react";
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
import SelectDataShow from "../../components/ui/SelectDataShow";
import DateFilter from "../../components/ui/DateFilter";
import { useAuth } from "../auth/useAuth";
import { ROLES } from "../../utils/roles";

export default function LaporanHarianPage() {
  const { user } = useAuth();
  const [laporan, setLaporan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  // default to empty string so all laporan are shown initially
  const [tanggal, setTanggal] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    id: null,
    tanggal: new Date().toISOString().slice(0, 10),
    deskripsi: "",
    status: STATUS.BELUM,
    bukti_link: "",
    catatan: "",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const url =
        user?.role === ROLES.ADMIN
          ? "/laporan-harian/all"
          : "/laporan-harian/mine";
      const res = await axios.get(url);
      setLaporan(res.data);
    } catch (err) {
      console.error("Gagal mengambil laporan", err);
    } finally {
      setLoading(false);
    }
  };

  const _openEdit = (item) => {
    setForm({
      id: item.id,
      tanggal: item.tanggal.slice(0, 10),
      deskripsi: item.deskripsi || "",
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

  const _remove = async (id) => {
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (user) fetchData(); }, [user]);

  const filtered = laporan.filter((l) => {
    const peg = l.pegawai?.nama?.toLowerCase() || "";
    const keg = l.penugasan?.kegiatan?.nama_kegiatan?.toLowerCase() || "";
    const desc = l.deskripsi?.toLowerCase() || "";
    const cat = l.catatan?.toLowerCase() || "";
    const stat = l.status.toLowerCase();
    const txt = `${peg} ${keg} ${desc} ${cat} ${stat}`;
    const matchQuery = txt.includes(query.toLowerCase());
    const matchDate = tanggal ? l.tanggal.slice(0, 10) === tanggal : true;
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
        <DateFilter
          tanggal={tanggal}
          setTanggal={(date) => {
            setTanggal(date);
            setCurrentPage(1);
          }}
          setCurrentPage={setCurrentPage}
        />
      </div>
      <>
        <div className="overflow-x-auto">
          <Table>
            <thead>
              <tr className={tableStyles.headerRow}>
                <th className={tableStyles.cell}>No</th>
                <th className={tableStyles.cell}>Kegiatan</th>
                <th className={tableStyles.cell}>Deskripsi Kegiatan</th>
                <th className={tableStyles.cell}>Tanggal</th>
                <th className={tableStyles.cell}>Status</th>
                <th className={tableStyles.cell}>Bukti</th>
                <th className={tableStyles.cell}>Catatan</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="py-10">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <svg
                        className="animate-spin h-8 w-8 text-blue-600"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 
              0 0 5.373 0 12h4zm2.93 6.364A8.001 
              8.001 0 0112 20v4c-6.627 
              0-12-5.373-12-12h4a8.001 
              8.001 0 006.364 2.93z"
                        ></path>
                      </svg>
                      <p className="text-gray-600 dark:text-gray-300 text-sm font-medium tracking-wide">
                        Memuat data laporan...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan="9"
                    className="py-6 text-center text-gray-600 dark:text-gray-300"
                  >
                    <div className="flex flex-col items-center space-y-1">
                      <span className="text-xl">🫰🫰🤟🤟😜☝☝</span>
                      <span className="text-sm font-medium tracking-wide">
                        Data tidak ditemukan.
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((item, idx) => (
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
                      <StatusBadge status={item.status} />
                    </td>
                    <td className={tableStyles.cell}>
                      {item.bukti_link ? (
                        <a
                          href={item.bukti_link}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <ExternalLink
                            size={16}
                            className="mx-auto text-blue-600 dark:text-blue-400"
                          />
                        </a>
                      ) : (
                        <X className="w-4 h-4 text-red-600" />
                      )}
                    </td>
                    <td className={tableStyles.cell}>{item.catatan || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
          <div className="flex items-center justify-between mt-2">
            <SelectDataShow
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              options={[5, 10, 25, 50]}
              className="w-32"
            />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </>
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
              <Label htmlFor="deskripsi">
                Deskripsi <span className="text-red-500">*</span>
              </Label>
              <textarea
                id="deskripsi"
                value={form.deskripsi}
                onChange={(e) =>
                  setForm({ ...form, deskripsi: e.target.value })
                }
                className="form-input"
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
