import { useEffect, useState } from "react";
import axios from "axios";
import { AlertCircle, Loader2, Download } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function MissedReportsPage() {
  const [data, setData] = useState({ day1: [], day3: [], day7: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("/monitoring/laporan/terlambat");
        setData(res.data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatDate = (iso) => {
    const date = new Date(iso);
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatToday = () => {
    const today = new Date();
    return today.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const daysSince = (iso) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(iso);
    d.setHours(0, 0, 0, 0);
    return Math.floor((today - d) / 86400000);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();

    const logoImg = new Image();
    logoImg.src = "/logo.png";

    logoImg.onload = () => {
      doc.addImage(logoImg, "PNG", 15, 10, 20, 20);
      doc.setFontSize(12);
      doc.text("BADAN PUSAT STATISTIK", 40, 16);
      doc.text("KABUPATEN BULUNGAN", 40, 22);
      doc.setFontSize(14);
      doc.text("Status Pelaporan Harian Pegawai", 105, 30, { align: "center" });
      doc.setFontSize(10);
      doc.text(`Dicetak pada: ${formatToday()}`, 105, 36, { align: "center" });

      const kategori = [
        { title: "Belum Melapor 1+ Hari", data: data.day1 },
        { title: "Belum Melapor 3+ Hari", data: data.day3 },
        { title: "Belum Melapor 7+ Hari", data: data.day7 },
      ];

      let currentY = 42;
      kategori.forEach((group) => {
        const rows = group.data.map((u) => [
          u.nama,
          u.lastDate ? `${daysSince(u.lastDate)} hari` : "-",
          u.lastDate ? formatDate(u.lastDate) : "Belum Pernah",
        ]);

        autoTable(doc, {
          startY: currentY,
          head: [[group.title]],
          theme: "plain",
          styles: { fontStyle: "bold", fontSize: 11 },
          headStyles: { textColor: [33, 37, 41] },
        });

        autoTable(doc, {
          startY: doc.lastAutoTable.finalY + 2,
          head: [["Nama", "Belum Melapor", "Terakhir Melapor"]],
          body: rows,
          styles: { fontSize: 9, cellPadding: 3 },
          headStyles: { fillColor: [63, 81, 181], textColor: 255 },
          margin: { top: 10 },
        });

        currentY = doc.lastAutoTable.finalY + 10;
      });

      doc.save("status_pelaporan_harian.pdf");
    };
  };

  const exportToExcel = () => {
    const allUsers = [...data.day1, ...data.day3, ...data.day7];
    const sheetData = allUsers.map((u) => ({
      Nama: u.nama,
      Hari_Tidak_Melapor: u.lastDate ? daysSince(u.lastDate) : "Belum pernah",
      Tanggal_Terakhir_Lapor: u.lastDate ? formatDate(u.lastDate) : "-",
    }));
    const ws = XLSX.utils.json_to_sheet(sheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Status_Pelaporan");
    XLSX.writeFile(wb, "status_pelaporan_harian.xlsx");
  };

  const renderList = (users) => (
    <div className="overflow-x-auto">
      <table className="min-w-full table-auto text-sm text-left text-gray-700 dark:text-gray-300">
        <thead className="bg-gray-100 dark:bg-gray-700 text-xs uppercase font-semibold">
          <tr>
            <th className="px-4 py-2">Nama</th>
            <th className="px-4 py-2 text-right">Status</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr
              key={u.userId}
              className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <td className="px-4 py-2 font-medium">{u.nama}</td>
              <td className="px-4 py-2 text-right">
                {u.lastDate ? (
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded-full">
                    Tidak melapor sejak {formatDate(u.lastDate)} (
                    {daysSince(u.lastDate)} hari)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold bg-gray-200 text-gray-700 rounded-full">
                    Belum pernah melapor
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const Card = ({ title, count, color, children }) => (
    <div
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 space-y-4 border-t-4"
      style={{ borderColor: color }}
    >
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-white">
          {title}
        </h2>
        <span className="text-2xl font-bold" style={{ color }}>
          {count}
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

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <AlertCircle className="w-6 h-6 text-red-500" />
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Status Pelaporan Harian Pegawai
        </h1>
        <div className="ml-auto flex gap-2">
          <button
            onClick={exportToExcel}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded"
          >
            <Download className="w-4 h-4" /> Excel
          </button>
          <button
            onClick={exportToPDF}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            <Download className="w-4 h-4" /> PDF
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-md text-center">
          Gagal memuat data. Silakan coba beberapa saat lagi.
        </div>
      )}

      {/* Loading / Data */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="animate-spin w-6 h-6 text-gray-500" />
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          <Card
            title="Belum Melapor Selama 1 Hari atau Lebih"
            count={data.day1.length}
            color="#facc15"
          >
            {renderList(data.day1)}
          </Card>
          <Card
            title="Belum Melapor Selama 3 Hari atau Lebih"
            count={data.day3.length}
            color="#f97316"
          >
            {renderList(data.day3)}
          </Card>
          <Card
            title="Belum Melapor Selama 7 Hari atau Lebih"
            count={data.day7.length}
            color="#dc2626"
          >
            {renderList(data.day7)}
          </Card>
        </div>
      )}
    </div>
  );
}
