import { useState, useEffect } from "react";
import Modal from "./ui/Modal";
import Button from "./ui/Button";
import Label from "./ui/Label";
import MonthYearPicker from "./ui/MonthYearPicker";
import { CalendarDays, CalendarRange } from "lucide-react";
import { showError, confirmCancel } from "../utils/alerts";

export default function ExportModal({ onClose, onConfirm }) {
  const [type, setType] = useState("bulanan");
  const [bulan, setBulan] = useState("");
  const [minggu, setMinggu] = useState("");
  const [weekOptions, setWeekOptions] = useState([]);

  // Hitung minggu berdasarkan bulan
  useEffect(() => {
    if (!bulan) return setWeekOptions([]);
    const year = new Date().getFullYear();
    const monthIdx = bulan - 1;
    const firstOfMonth = new Date(year, monthIdx, 1);
    const monthEnd = new Date(year, monthIdx + 1, 0);
    const firstMonday = new Date(firstOfMonth);
    firstMonday.setDate(
      firstOfMonth.getDate() - ((firstOfMonth.getDay() + 6) % 7)
    );

    const opts = [];
    for (
      let d = new Date(firstMonday);
      d <= monthEnd;
      d.setDate(d.getDate() + 7)
    ) {
      opts.push(opts.length + 1);
    }
    setWeekOptions(opts);
    if (minggu && minggu > opts.length) setMinggu("");
  }, [bulan, minggu]);

  const handleCancel = async () => {
    const result = await confirmCancel("Batalkan proses export?");
    if (result.isConfirmed) onClose();
  };

  const handleConfirm = () => {
    if (!bulan) {
      showError("Bulan belum dipilih");
      return;
    }
    if (type === "mingguan" && !minggu) {
      showError("Minggu belum dipilih");
      return;
    }

    const params = { bulan };
    if (type === "mingguan") params.minggu = minggu;
    onConfirm(params);
  };

  const exportDisabled =
    (type === "bulanan" && !bulan) ||
    (type === "mingguan" && (!bulan || !minggu));

  // Helper ringkasan
  const getMonthName = (index) =>
    new Date(2025, index - 1).toLocaleString("id-ID", {
      month: "long",
      year: "numeric",
    });

  return (
    <Modal onClose={onClose} titleId="export-modal-title">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">
            📦 Export Laporan
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Pilih rentang waktu dan parameter yang akan diekspor.
          </p>
        </div>

        {/* SECTION: Rentang Waktu */}
        <div className="border rounded-xl p-5 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 space-y-3">
          <h4 className="text-base font-semibold text-gray-700 dark:text-white">
            Rentang Waktu
          </h4>
          <div className="flex gap-4">
            {[
              { key: "bulanan", label: "Bulanan", icon: CalendarDays },
              { key: "mingguan", label: "Mingguan", icon: CalendarRange },
            ].map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setType(opt.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition ${
                  type === opt.key
                    ? "bg-blue-600 text-white border-blue-600 shadow"
                    : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                }`}
              >
                <opt.icon size={16} />
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* SECTION: Parameter */}
        <div className="border rounded-xl p-5 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 space-y-4">
          <h4 className="text-base font-semibold text-gray-700 dark:text-white">
            Parameter Export
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Bulan */}
            <div>
              <Label className="mb-1 block">Bulan</Label>
              <MonthYearPicker month={bulan} onMonthChange={setBulan} />
            </div>

            {/* Minggu */}
            <div>
              <Label className="mb-1 block">Minggu</Label>
              <select
                value={minggu}
                onChange={(e) => setMinggu(e.target.value)}
                disabled={type !== "mingguan"}
                className={`w-full border rounded-xl px-3 py-2 transition bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  type !== "mingguan" ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <option value="">Pilih Minggu</option>
                {weekOptions.map((w) => (
                  <option key={w} value={w}>
                    Minggu {w}
                  </option>
                ))}
              </select>
              {type !== "mingguan" && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">
                  Opsi minggu hanya aktif jika memilih rentang{" "}
                  <strong>mingguan</strong>.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* SECTION: Ringkasan Export */}
        <div className="border rounded-xl p-4 bg-yellow-50 dark:bg-yellow-900 border-yellow-300 dark:border-yellow-700">
          {bulan ? (
            <div className="text-sm text-yellow-900 dark:text-yellow-100 space-y-1">
              <p>
                <strong>Hasil Export:</strong>{" "}
                {type === "bulanan"
                  ? `Laporan Harian Bulan ${getMonthName(bulan)}`
                  : minggu
                  ? `Laporan Harian Minggu ${minggu} Bulan ${getMonthName(
                      bulan
                    )}`
                  : "Pilih minggu untuk melihat ringkasan"}
              </p>
            </div>
          ) : (
            <p className="text-sm italic text-yellow-800 dark:text-yellow-200">
              Pilih bulan terlebih dahulu untuk melihat ringkasan export.
            </p>
          )}
        </div>

        {/* Footer Aksi */}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={handleCancel}>
            Batal
          </Button>
          <Button onClick={handleConfirm} disabled={exportDisabled}>
            Export
          </Button>
        </div>
      </div>
    </Modal>
  );
}
