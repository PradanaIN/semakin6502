import { useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  Maximize2,
  Minimize2,
  Menu,
  ExternalLink,
  Download,
  Hash,
  CheckCircle2,
} from "lucide-react";
import Button from "../../components/ui/Button";
import bukuPanduan from "../../assets/buku_panduan_semakin.pdf";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

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
  // ambil ?page= dari URL jika ada
  const params =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : null;
  const initialPageFromUrl = params ? Number(params.get("page")) : NaN;

  const [page, setPage] = useState(
    Number.isFinite(initialPageFromUrl) && initialPageFromUrl > 0
      ? initialPageFromUrl
      : SECTIONS[0].page
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [fit, setFit] = useState("width"); // "width" | "page"
  const [zoomPercent, setZoomPercent] = useState(100); // hanya dipakai jika fit === "custom"
  const buttonRefs = useRef([]);
  const viewerRef = useRef(null);
  const [viewerSize, setViewerSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateSize = () => {
      if (viewerRef.current) {
        setViewerSize({
          width: viewerRef.current.clientWidth,
          height: viewerRef.current.clientHeight,
        });
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const currentSectionIndex = useMemo(() => {
    const idx = SECTIONS.findIndex((s) => s.page === page);
    return idx >= 0 ? idx : 0;
  }, [page]);

  // sinkronkan ?page= pada URL agar bisa dibagikan
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    url.searchParams.set("page", String(page));
    window.history.replaceState({}, "", url.toString());
  }, [page]);

  const goPrevSection = () => {
    const i = Math.max(0, currentSectionIndex - 1);
    setPage(SECTIONS[i].page);
  };
  const goNextSection = () => {
    const i = Math.min(SECTIONS.length - 1, currentSectionIndex + 1);
    setPage(SECTIONS[i].page);
  };

  // keyboard: ←/→ atau J/K
  useEffect(() => {
    const onKey = (e) => {
      const k = e.key.toLowerCase();
      if (k === "arrowright" || k === "j") {
        e.preventDefault();
        goNextSection();
      }
      if (k === "arrowleft" || k === "k") {
        e.preventDefault();
        goPrevSection();
      }
      if (k === "+") {
        e.preventDefault();
        setFit("custom");
        setZoomPercent((z) => Math.min(300, z + 10));
      }
      if (k === "-") {
        e.preventDefault();
        setFit("custom");
        setZoomPercent((z) => Math.max(50, z - 10));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [currentSectionIndex]);

  // navigasi fokus dengan ↑/↓ di daftar isi
  const onSidebarKeyDown = (e) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const buttons = buttonRefs.current;
    const currentIndex = buttons.indexOf(e.target);
    if (currentIndex === -1) return;
    const nextIndex =
      e.key === "ArrowDown"
        ? (currentIndex + 1) % buttons.length
        : (currentIndex - 1 + buttons.length) % buttons.length;
    buttons[nextIndex]?.focus();
  };

  // bangun URL PDF dengan parameter viewer native
  const pdfUrl = (() => {
    const zoom =
      fit === "width"
        ? "page-width"
        : fit === "page"
        ? "page-fit"
        : String(zoomPercent);
    const view = fit === "page" ? "Fit" : "FitH";
    return `${bukuPanduan}#page=${page}&view=${view}&zoom=${zoom}`;
  })();

  const canPrev = currentSectionIndex > 0;
  const canNext = currentSectionIndex < SECTIONS.length - 1;

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6">
      {/* Card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg">
        {/* Header */}
        <div className="relative flex items-center justify-between gap-3 p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600 text-white shadow">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                  Panduan Penggunaan
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Navigasi per bagian. Gunakan ←/→ atau J/K untuk berpindah cepat.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                icon
                aria-label="Buka di tab baru"
                onClick={() =>
                  window.open(
                    `${bukuPanduan}#page=${page}`,
                    "_blank",
                    "noopener,noreferrer"
                  )
                }
                className="h-9 w-9 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
              <Button
                icon
                aria-label="Unduh Panduan"
                onClick={() => {
                  const link = document.createElement("a");
                  link.href = bukuPanduan;
                  link.setAttribute("download", "");
                  document.body.appendChild(link);
                  link.click();
                  link.remove();
                }}
                className="h-9 w-9 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                icon
                className="lg:hidden h-9 w-9 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={() => setSidebarOpen((s) => !s)}
                aria-label="Buka daftar isi"
              >
                <Menu className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={pdfUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
              title="Buka di tab baru"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
            <a
              href={bukuPanduan}
              download
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              title="Unduh Panduan"
            >
              <Download className="h-4 w-4" />
            </a>
            <button
              className="lg:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={() => setSidebarOpen((s) => !s)}
              aria-label="Buka daftar isi"
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800" />

        {/* Layout utama */}
        <div className="relative grid grid-cols-1 lg:grid-cols-[300px,1fr]">
          {/* Sidebar desktop */}
          <aside className="hidden lg:block border-r border-gray-200 dark:border-gray-800">
            <Sidebar
              page={page}
              setPage={setPage}
              onKeyDown={onSidebarKeyDown}
              currentIndex={currentSectionIndex}
              buttonRefs={buttonRefs}
            />
          </aside>

          {/* Sidebar mobile overlay */}
          {sidebarOpen && (
            <div
              className="lg:hidden absolute inset-0 z-20 bg-black/40"
              onClick={() => setSidebarOpen(false)}
            >
              <div
                className="absolute left-0 top-0 h-full w-[85%] max-w-[320px] bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-4"
                onClick={(e) => e.stopPropagation()}
              >
                <Sidebar
                  page={page}
                  setPage={(p) => {
                    setPage(p);
                    setSidebarOpen(false);
                  }}
                  onKeyDown={onSidebarKeyDown}
                  currentIndex={currentSectionIndex}
                  buttonRefs={buttonRefs}
                />
              </div>
            </div>
          )}

          {/* Viewer */}
          <main className="relative min-h-[70vh] lg:min-h-[80vh]">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-6">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <Hash className="h-4 w-4" />
                <span className="font-medium">
                  {SECTIONS[currentSectionIndex]?.title}
                </span>
                <span className="text-gray-400">•</span>
                <span>Halaman {page}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={goPrevSection}
                  disabled={!canPrev}
                  variant="secondary"
                  className="gap-1 text-sm px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50"
                  aria-label="Ke bagian sebelumnya"
                >
                  <ChevronLeft className="h-4 w-4" /> Sebelumnya
                </Button>
                <Button
                  onClick={goNextSection}
                  disabled={!canNext}
                  variant="secondary"
                  className="gap-1 text-sm px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50"
                  aria-label="Ke bagian selanjutnya"
                >
                  Selanjutnya <ChevronRight className="h-4 w-4" />
                </Button>

                <span className="mx-2 h-5 w-px bg-gray-200 dark:bg-gray-700" />

                {/* Zoom mode */}
                <button
                  onClick={() => setFit("width")}
                  className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition ${
                    fit === "width"
                      ? "border-blue-600 text-blue-600"
                      : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                  title="Sesuaikan lebar"
                  aria-label="Sesuaikan lebar"
                >
                  <Minimize2 className="h-4 w-4" /> Lebar
                </button>
                <button
                  onClick={() => setFit("page")}
                  className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition ${
                    fit === "page"
                      ? "border-blue-600 text-blue-600"
                      : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                  title="Sesuaikan halaman"
                  aria-label="Sesuaikan halaman"
                >
                  <Maximize2 className="h-4 w-4" /> Halaman
                </button>

                {/* Zoom ± (aktif jika custom) */}
                <span className="mx-2 h-5 w-px bg-gray-200 dark:bg-gray-700" />
                <button
                  onClick={() => {
                    setFit("custom");
                    setZoomPercent((z) => Math.max(50, z - 10));
                  }}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition"
                  title="Perkecil"
                  aria-label="Perkecil"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="min-w-[48px] text-center text-sm text-gray-700 dark:text-gray-300">
                  {fit === "custom"
                    ? `${zoomPercent}%`
                    : fit === "page"
                    ? "Fit"
                    : "Lebar"}
                </span>
                <button
                  onClick={() => {
                    setFit("custom");
                    setZoomPercent((z) => Math.min(300, z + 10));
                  }}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition"
                  title="Perbesar"
                  aria-label="Perbesar"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* PDF (viewer native) */}
            <div className="px-4 sm:px-6 pb-6">
              <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                <div
                  ref={viewerRef}
                  className="h-[70vh] w-full lg:h-[80vh] overflow-auto flex justify-center"
                >
                  <Document
                    file={bukuPanduan}
                    loading={
                      <div className="p-6 text-gray-700 dark:text-gray-300">
                        Memuat...
                      </div>
                    }
                    error={
                      <div className="p-6 text-gray-700 dark:text-gray-300">
                        PDF tidak dapat dimuat.
                      </div>
                    }
                  >
                    <Page
                      pageNumber={page}
                      width={fit === "width" ? viewerSize.width : undefined}
                      height={fit === "page" ? viewerSize.height : undefined}
                      scale={fit === "custom" ? zoomPercent / 100 : 1}
                    />
                  </Document>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function Sidebar({ page, setPage, onKeyDown, currentIndex, buttonRefs }) {
  return (
    <div className="flex h-full flex-col">
      <nav
        aria-label="Navigasi Panduan"
        onKeyDown={onKeyDown}
        className="flex max-h-[70vh] flex-col overflow-y-auto p-4 pr-2 custom-scrollbar"
      >
        <ul className="flex flex-col gap-1 list-none">
          {SECTIONS.map((section, index) => {
            const isActive = page === section.page;
            return (
              <li key={section.title}>
                <button
                  onClick={() => setPage(section.page)}
                  aria-current={isActive ? "true" : undefined}
                  ref={(el) => (buttonRefs.current[index] = el)}
                  className={[
                    "group flex w-full items-center justify-between rounded-xl border text-left transition-all px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                    isActive
                      ? "border-blue-600/30 bg-gradient-to-r from-blue-500/10 via-sky-500/10 to-blue-500/10 dark:bg-blue-500/10"
                      : "border-transparent hover:border-gray-200 dark:hover:border-gray-700 hover:bg-gray-50/70 dark:hover:bg-gray-800/60",
                  ].join(" ")}
                >
                  <span className="flex items-center gap-2">
                    {isActive ? (
                      <CheckCircle2 className="h-4 w-4 text-blue-600" />
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-gray-300 group-hover:bg-gray-400" />
                    )}
                    <span
                      className={[
                        "text-sm",
                        isActive
                          ? "font-semibold text-gray-900 dark:text-white"
                          : "text-gray-700 dark:text-gray-200",
                      ].join(" ")}
                    >
                      {section.title}
                    </span>
                  </span>
                  <span className="text-xs text-gray-500">h. {section.page}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* footer tips ringkas */}
      <div className="mt-auto border-t border-gray-200 dark:border-gray-800 p-4 text-xs text-gray-500">
        <p className="mb-1">Tips cepat:</p>
        <ul className="list-disc pl-4 space-y-0.5">
          <li>
            <kbd className="rounded bg-gray-100 px-1">←/→</kbd> atau{" "}
            <kbd className="rounded bg-gray-100 px-1">J/K</kbd> untuk ganti
            bagian
          </li>
          <li>
            <kbd className="rounded bg-gray-100 px-1">+/−</kbd> untuk zoom
          </li>
        </ul>
      </div>
    </div>
  );
}
