import { useEffect, useMemo, useRef, useState } from "react";
import { BookOpen, Menu, ExternalLink, CheckCircle2 } from "lucide-react";
import Button from "../../components/ui/Button";
import bukuPanduan from "../../assets/buku_panduan_semakin.pdf";

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
  const buttonRefs = useRef([]);

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

  

  // navigasi fokus melalui keyboard di daftar isi tidak lagi didukung

  // URL PDF
  const pdfUrl = `${bukuPanduan}#page=${page}&view=FitH&zoom=page-width`;

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
                  Navigasi per bagian melalui daftar isi.
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
                className="lg:hidden h-9 w-9 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={() => setSidebarOpen((s) => !s)}
                aria-label="Buka daftar isi"
              >
                <Menu className="h-4 w-4" />
              </Button>
            </div>
          </div>

        <div className="border-t border-gray-200 dark:border-gray-800" />

        {/* Layout utama */}
        <div className="relative grid grid-cols-1 lg:grid-cols-[300px,1fr]">
          {/* Sidebar desktop */}
          <aside className="hidden lg:block border-r border-gray-200 dark:border-gray-800">
            <Sidebar page={page} setPage={setPage} buttonRefs={buttonRefs} />
          </aside>

          {/* Sidebar mobile overlay */}
          {sidebarOpen && (
            <div className="lg:hidden absolute inset-0 z-20">
              <div
                role="button"
                tabIndex={0}
                aria-label="Tutup daftar isi"
                className="absolute inset-0 bg-black/40"
                onClick={() => setSidebarOpen(false)}
                onKeyDown={(e) => e.key === "Escape" && setSidebarOpen(false)}
              />
              <div
                className="absolute left-0 top-0 h-full w-[85%] max-w-[320px] bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-4"
                onClick={(e) => e.stopPropagation()}
                role="presentation"
              >
                <Sidebar
                  page={page}
                  setPage={(p) => {
                    setPage(p);
                    setSidebarOpen(false);
                  }}
                  buttonRefs={buttonRefs}
                />
              </div>
            </div>
          )}

          {/* Viewer */}
          <main className="relative min-h-[70vh] lg:min-h-[80vh]">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-3 p-4 sm:p-6">
              <span className="font-medium text-sm text-gray-600 dark:text-gray-300">
                {SECTIONS[currentSectionIndex]?.title}
              </span>
            </div>

            {/* PDF (viewer native) */}
            <div className="px-4 sm:px-6 pb-6">
              <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                <object
                  key={page} // paksa reload ketika parameter berubah
                  data={pdfUrl}
                  type="application/pdf"
                  className="h-[70vh] w-full lg:h-[80vh]"
                  title="Buku Panduan"
                >
                  <div className="p-6 text-gray-700 dark:text-gray-300">
                    PDF tidak dapat dimuat.{" "}
                    <a href={bukuPanduan} className="text-blue-600 underline">
                      Buka di tab baru
                    </a>
                    .
                  </div>
                </object>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function Sidebar({ page, setPage, buttonRefs }) {
  return (
    <div className="flex h-full flex-col">
      <nav
        aria-label="Navigasi Panduan"
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
                  <span className="text-xs text-gray-500">
                    h. {section.page}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
