import { useEffect, useState } from "react";
import { BookOpen, ChevronDown } from "lucide-react";
import ReactMarkdown from "react-markdown";
import ReactPlayer from "react-player";
import { loadGuide } from "./loadGuide";

const VIDEO_URL = "https://www.youtube.com/watch?v=ysz5S6PUM-U";

export default function PanduanPage() {
  const [topics, setTopics] = useState([]);
  const [open, setOpen] = useState(null);
  const [playerError, setPlayerError] = useState(false);

  useEffect(() => {
    loadGuide().then(setTopics).catch(() => setTopics([]));
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-6 sm:p-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-md space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <BookOpen className="w-6 h-6 text-blue-600" />
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Panduan Penggunaan</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Pelajari alur kerja dan menu aplikasi.</p>
        </div>
      </div>

      {topics.length > 0 && (
        <nav className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
          <h3 className="font-semibold mb-2 text-gray-700 dark:text-gray-300">Daftar Isi</h3>
          <ul className="list-disc list-inside space-y-1 text-blue-600 dark:text-blue-400">
            {topics.map((t, idx) => (
              <li key={t.title}>
                <a href={`#section-${idx}`}>{t.title}</a>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <div className="space-y-4">
        {topics.map((t, idx) => (
          <div key={t.title} id={`section-${idx}`} className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
            <button
              type="button"
              className="w-full flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 text-left"
              onClick={() => setOpen(open === idx ? null : idx)}
            >
              <span className="font-semibold text-gray-700 dark:text-gray-300">{t.title}</span>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${open === idx ? "rotate-180" : ""}`} />
            </button>
            {open === idx && (
              <div className="p-4 prose dark:prose-invert">
                <ReactMarkdown>{t.content}</ReactMarkdown>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Video Panduan</h3>
        {!playerError ? (
          <div className="relative pt-[56.25%]">
            <ReactPlayer
              url={VIDEO_URL}
              width="100%"
              height="100%"
              className="absolute top-0 left-0"
              onError={() => setPlayerError(true)}
            />
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-400">
            Video tidak dapat ditampilkan. {" "}
            <a
              href={VIDEO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              Buka di YouTube
            </a>
          </p>
        )}
      </div>
    </div>
  );
}
