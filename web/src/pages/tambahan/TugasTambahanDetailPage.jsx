import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  showSuccess,
  confirmDelete,
  confirmCancel,
  handleAxiosError,
  showWarning,
} from "../../utils/alerts";
import { Pencil, Trash2, Plus } from "lucide-react";
import Select from "react-select";
import selectStyles from "../../utils/selectStyles";
import { STATUS, formatStatus } from "../../utils/status";
import StatusBadge from "../../components/ui/StatusBadge";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import Label from "../../components/ui/Label";
import Textarea from "../../components/ui/Textarea";
import formatDate from "../../utils/formatDate";
import Spinner from "../../components/Spinner";
import { useAuth } from "../auth/useAuth";
import { ROLES } from "../../utils/roles";

export default function TugasTambahanDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [item, setItem] = useState(null);
  const canManage = user?.id === item?.userId;
  const [editing, setEditing] = useState(false);
  const [kegiatan, setKegiatan] = useState([]);
  const [teams, setTeams] = useState([]);
  const [showUpload, setShowUpload] = useState(false);
  const [laporanForm, setLaporanForm] = useState({
    capaianKegiatan: "",
    tanggal: "",
    status: STATUS.SELESAI_DIKERJAKAN,
    buktiLink: "",
    deskripsi: "",
  });
  const [form, setForm] = useState({
    teamId: "",
    kegiatanId: "",
    tanggal: "",
    status: STATUS.BELUM,
    deskripsi: "",
    capaianKegiatan: "",
  });
  const tanggalRef = useRef(null);
  const laporanTanggalRef = useRef(null);

  const fetchKegiatanForTeam = useCallback(async (teamId) => {
    if (!teamId) {
      setKegiatan([]);
      return;
    }
    try {
      const res = await axios.get(`/master-kegiatan?team=${teamId}`);
      setKegiatan(res.data.data || res.data);
    } catch (err) {
      handleAxiosError(err, "Gagal mengambil kegiatan");
      setKegiatan([]);
    }
  }, []);

  const fetchDetail = useCallback(async () => {
    try {
      const dRes = await axios.get(`/tugas-tambahan/${id}`);
      setItem(dRes.data);

      const teamId = dRes.data.kegiatan?.teamId || "";
      await fetchKegiatanForTeam(teamId);

      setForm({
        teamId: teamId ? String(teamId) : "",
        kegiatanId: String(dRes.data.kegiatanId),
        tanggal: dRes.data.tanggal.slice(0, 10),
        status: dRes.data.status,
        deskripsi: dRes.data.deskripsi || "",
        capaianKegiatan: dRes.data.capaianKegiatan || "",
      });
    } catch (err) {
      handleAxiosError(err, "Gagal mengambil data");
    }
  }, [id, fetchKegiatanForTeam]);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await axios.get("/teams/all");
        setTeams(
          res.data.filter(
            (t) => t.namaTim !== "Admin" && t.namaTim !== "Pimpinan"
          )
        );
      } catch (err) {
        handleAxiosError(err, "Gagal mengambil tim");
      }
    };
    fetchTeams();
  }, []);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const handleTeamChange = async (o) => {
    const teamId = o ? o.value : "";
    setForm({ ...form, teamId, kegiatanId: "" });
    await fetchKegiatanForTeam(teamId);
  };

  const save = async () => {
    try {
      if (
        form.teamId === "" ||
        form.kegiatanId === "" ||
        form.tanggal === "" ||
        form.deskripsi.trim() === "" ||
        form.capaianKegiatan.trim() === "" ||
        form.status === ""
      ) {
        showWarning("Lengkapi data", "Semua field wajib diisi");
        return;
      }
      const payload = { ...form };
      delete payload.teamId;
      await axios.put(`/tugas-tambahan/${id}`, payload);
      showSuccess("Berhasil", "Kegiatan diperbarui");
      setEditing(false);
      fetchDetail();
    } catch (err) {
      handleAxiosError(err, "Gagal menyimpan");
    }
  };

  const addLaporan = async () => {
    try {
      if (
        laporanForm.capaianKegiatan.trim() === "" ||
        laporanForm.tanggal === "" ||
        laporanForm.status === ""
      ) {
        showWarning("Lengkapi data", "Semua field wajib diisi");
        return;
      }
      if (
        laporanForm.status === STATUS.SELESAI_DIKERJAKAN &&
        laporanForm.buktiLink.trim() === ""
      ) {
        showWarning("Lengkapi data", "Bukti Link wajib diisi");
        return;
      }
      const payload = { ...laporanForm };
      Object.keys(payload).forEach((k) => {
        if (payload[k] === "") delete payload[k];
      });
      await axios.post(`/tugas-tambahan/${id}/laporan`, payload);
      showSuccess("Berhasil", "Laporan ditambah");
      setLaporanForm({
        capaianKegiatan: "",
        tanggal: "",
        status: STATUS.SELESAI_DIKERJAKAN,
        buktiLink: "",
        deskripsi: "",
      });
      setShowUpload(false);
      fetchDetail();
    } catch (err) {
      handleAxiosError(err, "Gagal menambah laporan");
    }
  };

  const remove = async () => {
    const r = await confirmDelete("Hapus kegiatan ini?");
    if (!r.isConfirmed) return;
    try {
      await axios.delete(`/tugas-tambahan/${id}`);
      navigate(-1);
      setTimeout(() => showSuccess("Dihapus", "Kegiatan dihapus"), 100);
    } catch (err) {
      handleAxiosError(err, "Gagal menghapus");
    }
  };

  if (!item)
    return (
      <div className="p-6 text-center">
        <Spinner className="h-6 w-6 mx-auto" />
      </div>
    );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Detail Tugas Tambahan</h2>
        {canManage && !editing && (
          <div className="space-x-2">
            <Button
              onClick={() => setEditing(true)}
              variant="warning"
              icon
              aria-label="Edit"
            >
              <Pencil size={16} />
            </Button>
            <Button onClick={remove} variant="danger" icon aria-label="Hapus">
              <Trash2 size={16} />
            </Button>
          </div>
        )}
      </div>
      {!editing ? (
        <div className="space-y-2 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Tim
              </div>
              <div className="font-medium">
                {item.kegiatan.team?.namaTim || "-"}
              </div>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Nama Kegiatan
            </div>
            <div className="font-medium">{item.nama}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Tanggal
            </div>
            <div className="font-medium">{formatDate(item.tanggal)}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Deskripsi
            </div>
            <div className="font-medium">{item.deskripsi || "-"}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Status
            </div>
            <div className="font-medium">
              <StatusBadge status={item.status} />
            </div>
          </div>
          {item.tanggalSelesai && (
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Tanggal Selesai
              </div>
              <div className="font-medium">
                {formatDate(item.tanggalSelesai)}
                {item.tanggalSelesaiAkhir &&
                  ` - ${formatDate(item.tanggalSelesaiAkhir)}`}
              </div>
            </div>
          )}
          {item.buktiLink && (
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Bukti
              </div>
              <a
                href={item.buktiLink}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 underline dark:text-blue-400"
              >
                Link
              </a>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div>
            <label htmlFor="team" className="block text-sm mb-1">
              Tim <span className="text-red-500">*</span>
            </label>
            <Select
              inputId="team"
              classNamePrefix="react-select"
              styles={selectStyles}
              menuPortalTarget={document.body}
              options={teams.map((t) => ({
                value: t.id.toString(),
                label: t.namaTim,
              }))}
              value={
                form.teamId
                  ? {
                      value: form.teamId,
                      label: teams.find(
                        (t) => t.id.toString() === form.teamId
                      )?.namaTim,
                    }
                  : null
              }
              onChange={handleTeamChange}
              placeholder="Pilih tim..."
            />
          </div>
          <div>
            <label htmlFor="kegiatan" className="block text-sm mb-1">
              Kegiatan <span className="text-red-500">*</span>
            </label>
            <Select
              inputId="kegiatan"
              classNamePrefix="react-select"
              styles={selectStyles}
              menuPortalTarget={document.body}
              options={kegiatan.map((k) => ({
                value: k.id.toString(),
                label: k.namaKegiatan,
              }))}
              value={
                form.kegiatanId
                  ? {
                      value: form.kegiatanId,
                      label: kegiatan.find(
                        (k) => k.id.toString() === form.kegiatanId
                      )?.namaKegiatan,
                    }
                  : null
              }
              onChange={(o) =>
                setForm({ ...form, kegiatanId: o ? o.value : "" })
              }
              placeholder={
                form.teamId ? "Pilih kegiatan..." : "Pilih tim terlebih dahulu"
              }
              isDisabled={!form.teamId}
            />
          </div>
          <div>
            <label htmlFor="tanggal" className="block text-sm mb-1">
              Tanggal <span className="text-red-500">*</span>
            </label>
            <Input
              id="tanggal"
              type="date"
              value={form.tanggal}
              onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
              ref={tanggalRef}
              onFocus={() => tanggalRef.current?.showPicker?.()}
              className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700"
              required
            />
          </div>
          <div>
            <label htmlFor="deskripsi" className="block text-sm mb-1">
              Deskripsi <span className="text-red-500">*</span>
            </label>
            <textarea
              id="deskripsi"
              value={form.deskripsi}
              onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
              className="form-input"
              required
            />
          </div>

          <div>
            <label htmlFor="capaianKegiatan" className="block text-sm mb-1">
              Capaian Kegiatan <span className="text-red-500">*</span>
            </label>
            <textarea
              id="capaianKegiatan"
              value={form.capaianKegiatan}
              onChange={(e) =>
                setForm({ ...form, capaianKegiatan: e.target.value })
              }
              className="form-input resize-y w-full min-h-[48px] border rounded px-3 py-2 bg-white dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          <div>
            <label htmlFor="status" className="block text-sm mb-1">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              id="status"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700"
              required
            >
              <option value={STATUS.BELUM}>{formatStatus(STATUS.BELUM)}</option>
              <option value={STATUS.SEDANG_DIKERJAKAN}>
                {formatStatus(STATUS.SEDANG_DIKERJAKAN)}
              </option>
              <option value={STATUS.SELESAI_DIKERJAKAN}>
                {formatStatus(STATUS.SELESAI_DIKERJAKAN)}
              </option>
            </select>
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <Button
              variant="secondary"
              onClick={async () => {
                const r = await confirmCancel("Batalkan perubahan?");
                if (r.isConfirmed) setEditing(false);
              }}
            >
              Batal
            </Button>
            <Button onClick={save}>Simpan</Button>
          </div>
        </div>
      )}
      <div className="space-y-2 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold">Laporan Harian</h3>
        {canManage && (
          <div className="flex justify-end">
            <Button onClick={() => setShowUpload(true)} className="add-button">
              <Plus size={16} />
              <span className="hidden sm:inline">Laporan Harian</span>
            </Button>
          </div>
        )}
      </div>

      {showUpload && (
        <Modal
          onClose={() => setShowUpload(false)}
          titleId="laporan-form-title"
        >
          <div className="space-y-4">
            <h3 id="laporan-form-title" className="text-lg font-semibold">
              Tambah Laporan Harian
            </h3>
            <form className="space-y-2">
              <div>
                <Label htmlFor="laporanCapaian">
                  Capaian Kegiatan <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="laporanCapaian"
                  value={laporanForm.capaianKegiatan}
                  onChange={(e) =>
                    setLaporanForm({
                      ...laporanForm,
                      capaianKegiatan: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="laporanTanggal">
                  Tanggal <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="laporanTanggal"
                  type="date"
                  value={laporanForm.tanggal}
                  onChange={(e) =>
                    setLaporanForm({
                      ...laporanForm,
                      tanggal: e.target.value,
                    })
                  }
                  ref={laporanTanggalRef}
                  onFocus={() => laporanTanggalRef.current?.showPicker?.()}
                  className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700"
                  required
                />
              </div>
              <div>
                <Label htmlFor="laporanStatus">
                  Status <span className="text-red-500">*</span>
                </Label>
                <select
                  id="laporanStatus"
                  value={laporanForm.status}
                  onChange={(e) =>
                    setLaporanForm({ ...laporanForm, status: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700"
                  required
                >
                  <option value={STATUS.BELUM}>
                    {formatStatus(STATUS.BELUM)}
                  </option>
                  <option value={STATUS.SEDANG_DIKERJAKAN}>
                    {formatStatus(STATUS.SEDANG_DIKERJAKAN)}
                  </option>
                  <option value={STATUS.SELESAI_DIKERJAKAN}>
                    {formatStatus(STATUS.SELESAI_DIKERJAKAN)}
                  </option>
                </select>
              </div>
              {laporanForm.status === STATUS.SELESAI_DIKERJAKAN && (
                <div>
                  <Label htmlFor="laporanBukti">
                    Bukti Link <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="laporanBukti"
                    type="url"
                    value={laporanForm.buktiLink}
                    onChange={(e) =>
                      setLaporanForm({
                        ...laporanForm,
                        buktiLink: e.target.value,
                      })
                    }
                    className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-700"
                    required
                  />
                </div>
              )}
              <div>
                <Label htmlFor="laporanCatatan">Catatan</Label>
                <Textarea
                  id="laporanCatatan"
                  value={laporanForm.deskripsi}
                  onChange={(e) =>
                    setLaporanForm({
                      ...laporanForm,
                      deskripsi: e.target.value,
                    })
                  }
                />
              </div>
            </form>
            <div className="flex justify-end gap-2 mt-6">
              <Button
                variant="secondary"
                onClick={async () => {
                  const r = await confirmCancel(
                    "Batalkan menambah laporan harian?"
                  );
                  if (r.isConfirmed) {
                    setShowUpload(false);
                  }
                }}
              >
                Batal
              </Button>
              <Button onClick={addLaporan}>Simpan Laporan</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
