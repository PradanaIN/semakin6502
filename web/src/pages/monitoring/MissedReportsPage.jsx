import { useEffect, useState } from "react";
import axios from "axios";
import { AlertCircle, Download } from "lucide-react";
import Spinner from "../../components/Spinner";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import formatDate from "../../utils/formatDate";
import exportFileName from "../../utils/exportFileName";

const formatWita = (iso) => {
  const date = new Date(iso);
  const formattedDate = date.toLocaleDateString("id-ID", {
    timeZone: "Asia/Makassar",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const formattedTime = date.toLocaleTimeString("id-ID", {
    timeZone: "Asia/Makassar",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  return `${formattedDate} pukul ${formattedTime} WITA`;
};

const MissedReportsPage = () => {
  const [data, setData] = useState({ day1: [], day3: [], day7: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lastUpdate, setLastUpdate] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reportRes, updateRes] = await Promise.all([
          axios.get("/monitoring/laporan/terlambat"),
          axios.get("/monitoring/last-update"),
        ]);
        setData(reportRes.data);
        setLastUpdate(updateRes.data.lastUpdate);
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

  const daysSince = (iso) => {
    const today = new Date();
    const date = new Date(iso);
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return Math.floor((today - date) / 86400000);
  };

  const exportToPDF = () => {
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
      doc.text("Status Pelaporan Harian Pegawai", pageWidth / 2, 95, {
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

      const sections = [
        {
          title: "Belum Melapor 1+ Hari",
          data: data.day1,
          color: [255, 193, 7],
        },
        {
          title: "Belum Melapor 3+ Hari",
          data: data.day3,
          color: [255, 152, 0],
        },
        {
          title: "Belum Melapor 7+ Hari",
          data: data.day7,
          color: [244, 67, 54],
        },
      ];

      sections.forEach(({ title, data, color }) => {
        // Subjudul
        autoTable(doc, {
          startY: y,
          head: [[title]],
          theme: "plain",
          headStyles: {
            fontStyle: "bold",
            textColor: color,
            fontSize: 12,
          },
          styles: {
            fontStyle: "bold",
            halign: "left",
          },
        });

        const rows = data.map((u) => [
          u.nama,
          u.lastDate ? `${daysSince(u.lastDate)} hari` : "-",
          u.lastDate ? formatDate(u.lastDate) : "Belum Pernah",
        ]);

        autoTable(doc, {
          startY: doc.lastAutoTable.finalY + 4,
          head: [["Nama", "Belum Melapor", "Terakhir Melapor"]],
          body: rows,
          theme: "striped",
          styles: {
            fontSize: 9,
            cellPadding: { top: 4, bottom: 4, left: 6, right: 6 },
          },
          headStyles: {
            fillColor: color,
            textColor: [255, 255, 255],
            fontStyle: "bold",
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245],
          },
        });

        y = doc.lastAutoTable.finalY + 16;
      });

      const name = `${exportFileName("LaporanTerlambat")}.pdf`;
      doc.save(name);
    };
  };

  const exportToExcel = () => {
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
      ["Status Pelaporan Harian Pegawai"],
      [`Dicetak pada: ${todayStr}`],
      [],
    ]);

    const addSection = (title, users) => {
      XLSX.utils.sheet_add_aoa(ws, [[title]], { origin: -1 });
      XLSX.utils.sheet_add_aoa(
        ws,
        [["Nama", "Belum Melapor", "Terakhir Melapor"]],
        { origin: -1 }
      );

      const rows = users.map((u) => [
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

    // Lebar kolom
    ws["!cols"] = [{ wch: 30 }, { wch: 18 }, { wch: 20 }];

    XLSX.utils.book_append_sheet(wb, ws, "Status_Pelaporan");
    const name = `${exportFileName("LaporanTerlambat")}.xlsx`;
    XLSX.writeFile(wb, name);
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
        <span className="text-xl font-bold" style={{ color }}>
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

  const renderList = (users) => (
    <table className="min-w-full text-sm text-left text-gray-800 dark:text-gray-200">
      <thead className="bg-gray-100 dark:bg-gray-700 text-xs font-semibold uppercase">
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
              className="px-4 py-2 font-medium max-w-[220px] truncate"
              title={u.nama}
            >
              {u.nama}
            </td>
            <td className="px-4 py-2 text-right">
              {u.lastDate ? (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-100 rounded-full">
                  {formatDate(u.lastDate)} • {daysSince(u.lastDate)} hari lalu
                </span>
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
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-6 h-6 text-red-500" />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Status Pelaporan Harian Pegawai
          </h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportToExcel}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-sm transition"
          >
            <Download className="w-4 h-4" /> Excel
          </button>
          <button
            onClick={exportToPDF}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition"
          >
            <Download className="w-4 h-4" /> PDF
          </button>
        </div>
      </div>

      {lastUpdate && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Data terakhir diperbarui: <strong>{formatWita(lastUpdate)}</strong>
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
        <div className="grid md:grid-cols-3 gap-6">
          <Card
            title="Belum Melapor 1 Hari +"
            count={data.day1.length}
            color="#facc15"
          >
            {renderList(data.day1)}
          </Card>
          <Card
            title="Belum Melapor 3 Hari +"
            count={data.day3.length}
            color="#f97316"
          >
            {renderList(data.day3)}
          </Card>
          <Card
            title="Belum Melapor 7 Hari +"
            count={data.day7.length}
            color="#dc2626"
          >
            {renderList(data.day7)}
          </Card>
        </div>
      )}
    </div>
  );
};

export default MissedReportsPage;
