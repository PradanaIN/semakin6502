import { useEffect, useMemo, useState } from "react";
import getHolidays from "../../utils/holidays";
import axios from "axios";
import { AlertCircle } from "lucide-react";
import { FaFileExcel, FaFilePdf } from "react-icons/fa";
import Spinner from "../../components/Spinner";
import Button from "../../components/ui/Button";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import formatDate from "../../utils/formatDate";
import formatWita from "../../utils/formatWita";
import exportFileName from "../../utils/exportFileName";


const MissedReportsPage = () => {
  const [data, setData] = useState({ day1: [], day3: [], day7: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastUpdate, setLastUpdate] = useState("");
  const [exportingExcel, setExportingExcel] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reportRes, updateRes] = await Promise.all([
          axios.get("/monitoring/laporan/terlambat"),
          axios.get("/monitoring/last-update"),
        ]);
        setData(reportRes.data);
        // Gabungkan libur untuk tahun sebelumnya, berjalan, dan berikutnya agar aman lintas tahun
        const now = new Date();
        const y = now.getFullYear();
        const all = [
          ...getHolidays(y - 1),
          ...getHolidays(y),
          ...getHolidays(y + 1),
        ];
        setHolidays(all);
        // Use server-provided fetchedAt for true load time; fallbacks retained
        if (updateRes?.data?.fetchedAt) {
          setLastUpdate(updateRes.data.fetchedAt);
        } else if (updateRes?.headers?.date || reportRes?.headers?.date) {
          const h = updateRes?.headers?.date || reportRes?.headers?.date;
          setLastUpdate(new Date(h).toISOString());
        } else if (updateRes?.data?.lastUpdate) {
          setLastUpdate(updateRes.data.lastUpdate);
        } else {
          setLastUpdate(new Date().toISOString());
        }
        setError(false);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const intervalId = setInterval(fetchData, 60000);
    return () => clearInterval(intervalId);
  }, []);

  const formatToday = () =>
    new Date().toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  // Hitung selisih hari kerja (Senin-Jumat) antara tanggal terakhir dan hari ini
  const [holidays, setHolidays] = useState([]);
  const holidaySet = useMemo(() => new Set(holidays), [holidays]);

  const daysSince = (iso) => {
    if (!iso) return 0;
    const to = new Date();
    const from = new Date(iso);
    to.setHours(0, 0, 0, 0);
    from.setHours(0, 0, 0, 0);
    if (to <= from) return 0;
    const MS = 86400000;
    const days = Math.floor((to - from) / MS);
    const fullWeeks = Math.floor(days / 7);
    let workdays = fullWeeks * 5;
    let rem = days % 7;
    // Mulai hitung dari hari setelah tanggal terakhir
    let dow = (from.getDay() + 1) % 7; // 0=Sunday..6=Saturday (lokal)
    for (let i = 0; i < rem; i++) {
      if (dow !== 0 && dow !== 6) workdays += 1;
      dow = (dow + 1) % 7;
    }
    // Kurangi libur/cuti bersama di hari kerja pada rentang (from, to]
    for (let i = 1; i <= days; i++) {
      const cur = new Date(from.getTime() + i * MS);
      const isWeekend = cur.getDay() === 0 || cur.getDay() === 6;
      if (!isWeekend) {
        const y = cur.getFullYear();
        const m = String(cur.getMonth() + 1).padStart(2, "0");
        const d = String(cur.getDate()).padStart(2, "0");
        if (holidaySet.has(`${y}-${m}-${d}`)) workdays -= 1;
      }
    }
    return workdays;
  };

  const exportToPDF = () => {
    setExportingPdf(true);
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "A4",
    });
    const pageWidth = doc.internal.pageSize.getWidth();
    const logo = new Image();
    logo.src = "/logo.png";

    logo.onload = () => {
      doc.addImage(logo, "PNG", 40, 30, 40, 40);

      // Header kanan
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("BADAN PUSAT STATISTIK", 95, 45);
      doc.text("KABUPATEN BULUNGAN", 95, 63);

      // Judul tengah
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Status Laporan Harian Pegawai", pageWidth / 2, 95, {
        align: "center",
      });

      // Tanggal
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Dicetak pada: ${formatToday()}`, pageWidth / 2, 112, {
        align: "center",
      });

      // Data sections
      let y = 130;

      // Palet warna lembut untuk PDF (fill ringan + teks gelap)
      const sections = [
        {
          title: "Belum Melapor 1+ Hari",
          data: data.day1,
          fill: [253, 230, 138], // amber-200
          accent: [180, 83, 9], // amber-700
        },
        {
          title: "Belum Melapor 3+ Hari",
          data: data.day3,
          fill: [254, 215, 170], // orange-200
          accent: [194, 65, 12], // orange-700
        },
        {
          title: "Belum Melapor 7+ Hari",
          data: data.day7,
          fill: [254, 202, 202], // red-200
          accent: [185, 28, 28], // red-700
        },
      ];

      sections.forEach(({ title, data, fill, accent }) => {
        // Subjudul
        autoTable(doc, {
          startY: y,
          head: [[title]],
          theme: "plain",
          headStyles: {
            fontStyle: "bold",
            textColor: accent,
            fontSize: 12,
          },
          styles: {
            fontStyle: "bold",
            halign: "left",
          },
        });

        const rows = data.map((u, i) => [
          i + 1,
          u.nama,
          u.lastDate ? `${daysSince(u.lastDate)} hari` : "-",
          u.lastDate ? formatDate(u.lastDate) : "Belum Pernah",
        ]);

        autoTable(doc, {
          startY: doc.lastAutoTable.finalY + 4,
          head: [["No", "Nama", "Belum Melapor", "Terakhir Melapor"]],
          body: rows,
          theme: "striped",
          styles: {
            fontSize: 9,
            cellPadding: { top: 4, bottom: 4, left: 6, right: 6 },
          },
          headStyles: {
            fillColor: fill,
            textColor: [31, 41, 55], // gray-800 untuk keterbacaan
            fontStyle: "bold",
          },
          columnStyles: {
            0: { halign: "center", cellWidth: 28 },
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245],
          },
        });

        y = doc.lastAutoTable.finalY + 16;
      });

      // Footer nomor halaman + sumber
      const pages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pages; i++) {
        doc.setPage(i);
        const w = doc.internal.pageSize.getWidth();
        const h = doc.internal.pageSize.getHeight();
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text("Sumber: SEMAKIN 6502", 40, h - 16, { align: "left" });
        doc.text(`Halaman ${i} dari ${pages}` , w / 2, h - 16, { align: "center" });
      }

      const name = `${exportFileName("LaporanTerlambat")}.pdf`;
      doc.save(name);
      setExportingPdf(false);
    };
    logo.onerror = () => {
      setExportingPdf(false);
    };
  };

  const exportToExcel = () => {
    setExportingExcel(true);
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([]);

    // Tanggal saat ini
    const now = new Date();
    const todayStr = now.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    // Judul dan metadata
    XLSX.utils.sheet_add_aoa(ws, [
      ["BADAN PUSAT STATISTIK"],
      ["KABUPATEN BULUNGAN"],
      ["Status Laporan Harian Pegawai"],
      [`Dicetak pada: ${todayStr}`],
      [],
    ]);

    const addSection = (title, users) => {
      XLSX.utils.sheet_add_aoa(ws, [[title]], { origin: -1 });
      XLSX.utils.sheet_add_aoa(
        ws,
        [["No", "Nama", "Belum Melapor", "Terakhir Melapor"]],
        { origin: -1 }
      );

      const rows = users.map((u, i) => [
        i + 1,
        u.nama,
        u.lastDate ? `${daysSince(u.lastDate)} hari` : "-",
        u.lastDate ? formatDate(u.lastDate) : "Belum Pernah",
      ]);
      XLSX.utils.sheet_add_aoa(ws, rows, { origin: -1 });

      // Tambahkan baris kosong antar section
      XLSX.utils.sheet_add_aoa(ws, [[]], { origin: -1 });
    };

    addSection("Belum Melapor 1+ Hari", data.day1);
    addSection("Belum Melapor 3+ Hari", data.day3);
    addSection("Belum Melapor 7+ Hari", data.day7);

    // Lebar kolom (No, Nama, Belum Melapor, Terakhir Melapor)
    ws["!cols"] = [{ wch: 6 }, { wch: 30 }, { wch: 18 }, { wch: 20 }];

    XLSX.utils.book_append_sheet(wb, ws, "Status_Pelaporan");
    const name = `${exportFileName("LaporanTerlambat")}.xlsx`;
    XLSX.writeFile(wb, name);
    setExportingExcel(false);
  };

  const Card = ({ title, count, color, children }) => (
    <div
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 space-y-4 border-l-4"
      style={{ borderColor: color }}
    >
      <div className="flex justify-between items-center">
        <h2 className="text-base font-semibold text-gray-700 dark:text-white">
          {title}
        </h2>
        <span className="text-xl font-semibold" style={{ color }}>
          {count} Pegawai
        </span>
      </div>
      <div className="max-h-72 overflow-y-auto pr-1 custom-scrollbar">
        {count > 0 ? (
          children
        ) : (
          <p className="text-sm text-gray-400 italic">
            Semua pegawai telah melapor
          </p>
        )}
      </div>
    </div>
  );

  const badgeClassesFor = (days) => {
    if (days >= 7)
      return "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-200";
    if (days >= 3)
      return "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-200";
    return "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200";
  };

  const renderList = (users) => (
    <table className="min-w-full text-sm text-left text-gray-800 dark:text-gray-200">
      <thead className="sticky top-0 z-10 bg-gray-100 dark:bg-gray-700 text-xs font-semibold uppercase">
        <tr>
          <th className="px-4 py-2">Nama</th>
          <th className="px-4 py-2 text-right">Terakhir Melapor</th>
        </tr>
      </thead>
      <tbody>
        {users.map((u) => (
          <tr
            key={u.userId}
            className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <td
              className="px-4 py-2 font-medium max-w-[240px] md:max-w-[280px] truncate"
              title={u.nama}
            >
              {u.nama}
            </td>
            <td className="px-4 py-2 text-right">
              {u.lastDate ? (
                (() => {
                  const d = daysSince(u.lastDate);
                  return (
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${badgeClassesFor(
                        d
                      )}`}
                    >
                      {formatDate(u.lastDate)} • {d} hari lalu
                    </span>
                  );
                })()
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-full">
                  Belum pernah melapor
                </span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="max-w-screen-xl mx-auto px-4 md:px-6 py-6 space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-6 h-6 text-red-500" />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Status Laporan Harian Pegawai
          </h1>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={exportToExcel}
            loading={exportingExcel}
            className="px-4 py-2"
          >
            <span className="inline-flex items-center gap-2">
              <FaFileExcel className="w-4 h-4" /> .xlsx
            </span>
          </Button>
          <Button
            onClick={exportToPDF}
            loading={exportingPdf}
            className="px-4 py-2 bg-red-600 hover:bg-red-700"
          >
            <span className="inline-flex items-center gap-2">
              <FaFilePdf className="w-4 h-4" /> .pdf
            </span>
          </Button>
        </div>
      </div>

      {lastUpdate && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Data terakhir dimuat: <strong>{formatWita(lastUpdate)}</strong>
        </p>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-md text-center">
          Gagal memuat data. Silakan coba beberapa saat lagi.
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Spinner className="w-6 h-6 text-gray-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card
            title="Belum Melapor 1+ Hari"
            count={data.day1.length}
            color="#f59e0b"
          >
            {renderList(data.day1)}
          </Card>
          <Card
            title="Belum Melapor 3+ Hari"
            count={data.day3.length}
            color="#ea580c"
          >
            {renderList(data.day3)}
          </Card>
          <Card
            title="Belum Melapor 7+ Hari"
            count={data.day7.length}
            color="#ef4444"
          >
            {renderList(data.day7)}
          </Card>
        </div>
      )}
    </div>
  );
};

export default MissedReportsPage;
