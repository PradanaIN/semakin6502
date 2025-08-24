import { useRef, useState } from "react";
import { BookOpen } from "lucide-react";
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
  const [page, setPage] = useState(SECTIONS[0].page);
  const buttonRefs = useRef([]);

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

        <div className="flex-1">
          <object
            key={page}
            data={`${bukuPanduan}#page=${page}`}
            type="application/pdf"
            className="w-full md:h-[80vh]"
            title="Buku Panduan"
          >
            <p className="text-gray-600 dark:text-gray-400">
              PDF tidak dapat dimuat.{" "}
              <a
                href={bukuPanduan}
                download
                className="text-blue-600 underline"
              >
                Unduh Buku Panduan
              </a>
            </p>
          </object>
        </div>
      </div>
    </div>
  );
}
