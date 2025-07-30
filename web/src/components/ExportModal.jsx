import { useState, useEffect } from "react";
import Modal from "./ui/Modal";
import Button from "./ui/Button";
import Label from "./ui/Label";
import MonthYearPicker from "./ui/MonthYearPicker";

export default function ExportModal({ onClose, onConfirm }) {
  const [type, setType] = useState("bulanan");
  const [bulan, setBulan] = useState("");
  const [minggu, setMinggu] = useState("");
  const [weekOptions, setWeekOptions] = useState([]);

  useEffect(() => {
    if (!bulan) {
      setWeekOptions([]);
      return;
    }
    const year = new Date().getFullYear();
    const monthIdx = bulan - 1;
    const firstOfMonth = new Date(year, monthIdx, 1);
    const monthEnd = new Date(year, monthIdx + 1, 0);
    const firstMonday = new Date(firstOfMonth);
    firstMonday.setDate(firstOfMonth.getDate() - ((firstOfMonth.getDay() + 6) % 7));
    const opts = [];
    for (let d = new Date(firstMonday); d <= monthEnd; d.setDate(d.getDate() + 7)) {
      opts.push(opts.length + 1);
    }
    setWeekOptions(opts);
    if (minggu && minggu > opts.length) setMinggu("");
  }, [bulan, minggu]);

  const handleConfirm = () => {
    const params = {};
    if (bulan) params.bulan = bulan;
    if (type === "mingguan" && minggu) params.minggu = minggu;
    onConfirm(params);
  };

  return (
    <Modal onClose={onClose} titleId="export-modal-title">
      <h3 id="export-modal-title" className="text-lg font-semibold">
        Export Laporan
      </h3>
      <div className="space-y-4">
        <div>
          <Label className="mb-2 block">Rentang</Label>
          <div className="space-x-4">
            <label className="inline-flex items-center space-x-1">
              <input
                type="radio"
                checked={type === "bulanan"}
                onChange={() => setType("bulanan")}
              />
              <span>Bulanan</span>
            </label>
            <label className="inline-flex items-center space-x-1">
              <input
                type="radio"
                checked={type === "mingguan"}
                onChange={() => setType("mingguan")}
              />
              <span>Mingguan</span>
            </label>
          </div>
        </div>
        <MonthYearPicker month={bulan} onMonthChange={setBulan} />
        {type === "mingguan" && (
          <select
            value={minggu}
            onChange={(e) => setMinggu(e.target.value)}
            className="cursor-pointer border border-gray-300 dark:border-gray-600 rounded-xl px-2 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none"
          >
            <option value="">Minggu</option>
            {weekOptions.map((w) => (
              <option key={w} value={w}>
                Minggu {w}
              </option>
            ))}
          </select>
        )}
      </div>
      <div className="flex justify-end space-x-2 pt-4">
        <Button variant="secondary" onClick={onClose}>
          Batal
        </Button>
        <Button onClick={handleConfirm}>Export</Button>
      </div>
    </Modal>
  );
}
