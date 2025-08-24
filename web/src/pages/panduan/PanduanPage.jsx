import { useState } from "react";
import { BookOpen } from "lucide-react";
import bukuPanduan from "../../assets/buku_panduan_semakin.pdf";

const SECTIONS = [
  { title: "Deskripsi Penggunaan", page: 2 },
  { title: "Workflow", page: 3 },
  { title: "Dashboard", page: 6 },
];

export default function PanduanPage() {
  const [page, setPage] = useState(SECTIONS[0].page);

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

      <div className="flex gap-4">
        <nav className="flex flex-col gap-2 w-48">
          {SECTIONS.map((section) => (
            <button
              key={section.title}
              onClick={() => setPage(section.page)}
              className={`px-3 py-1 text-sm rounded ${
                page === section.page
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              }`}
            >
              {section.title}
            </button>
          ))}
        </nav>

        <div className="flex-1 h-[80vh]">
          <object
            data={`${bukuPanduan}#page=${page}`}
            type="application/pdf"
            className="w-full h-full"
            title="Buku Panduan"
          >
            <p className="text-gray-600 dark:text-gray-400">
              PDF tidak dapat dimuat.{" "}
              <a href={bukuPanduan} download className="text-blue-600 underline">
                Unduh Buku Panduan
              </a>
            </p>
          </object>
        </div>
      </div>
    </div>
  );
}
