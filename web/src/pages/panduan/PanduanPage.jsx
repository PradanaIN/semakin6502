import { useRef, useState } from "react";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
} from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import bukuPanduan from "../../assets/buku_panduan_semakin.pdf";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

const SECTIONS = [
  { title: "Pendahuluan", page: 2 },
  { title: "Login", page: 4 },
  { title: "Dashboard", page: 5 },
  { title: "Tugas Mingguan", page: 9 },
  { title: "Tugas Tambahan", page: 16 },
  { title: "Laporan Harian", page: 22 },
  { title: "Monitoring", page: 24 },
  { title: "Keterlambatan", page: 27 },
  { title: "Master Kegiatan", page: 28 },
  { title: "Penutup", page: 29 },
];

export default function PanduanPage() {
  const [page, setPage] = useState(SECTIONS[0].page);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1);
  const buttonRefs = useRef([]);

  const handleDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const nextPage = () => setPage((p) => Math.min(p + 1, numPages));
  const prevPage = () => setPage((p) => Math.max(p - 1, 1));
  const zoomIn = () => setScale((s) => s + 0.25);
  const zoomOut = () => setScale((s) => Math.max(s - 0.25, 0.5));

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const buttons = buttonRefs.current;
      const currentIndex = buttons.indexOf(e.target);
      if (currentIndex === -1) return;

      const nextIndex =
        e.key === "ArrowDown"
          ? (currentIndex + 1) % buttons.length
          : (currentIndex - 1 + buttons.length) % buttons.length;

      buttons[nextIndex]?.focus();
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 sm:p-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-md space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <BookOpen className="w-6 h-6 text-blue-600" />
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            Panduan Penggunaan
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Pelajari alur kerja dan menu aplikasi.
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <nav
          aria-label="Navigasi Panduan"
          className="w-full md:w-48"
          onKeyDown={handleKeyDown}
        >
          <ul className="flex flex-col gap-2">
            {SECTIONS.map((section, index) => (
              <li key={section.title}>
                <button
                  onClick={() => setPage(section.page)}
                  aria-current={page === section.page ? "true" : undefined}
                  ref={(el) => (buttonRefs.current[index] = el)}
                  className={`px-3 py-1 text-sm rounded focus:outline-none focus:ring ${
                    page === section.page
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  }`}
                >
                  {section.title}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={prevPage}
                disabled={page <= 1}
                className="p-1 rounded border disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {page} / {numPages || "?"}
              </span>
              <button
                onClick={nextPage}
                disabled={page >= numPages}
                className="p-1 rounded border disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={zoomOut} className="p-1 rounded border">
                <Minus className="w-4 h-4" />
              </button>
              <button onClick={zoomIn} className="p-1 rounded border">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
          <Document
            file={bukuPanduan}
            onLoadSuccess={handleDocumentLoadSuccess}
            className="[&_.react-pdf__Page]:mx-auto"
          >
            <Page pageNumber={page} scale={scale} />
          </Document>
          <a
            href={bukuPanduan}
            download
            className="inline-block mt-2 px-4 py-2 bg-blue-600 text-white rounded"
          >
            Unduh Panduan
          </a>
        </div>
      </div>
    </div>
  );
}
