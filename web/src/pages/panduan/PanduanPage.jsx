import { BookOpen } from "lucide-react";
import topics from "./topics";

export default function PanduanPage() {
  return (
    <div className="max-w-3xl mx-auto p-6 sm:p-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-md space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <BookOpen className="w-6 h-6 text-blue-600" />
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Panduan Penggunaan</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Pelajari alur kerja dan menu aplikasi.</p>
        </div>
      </div>

      <div className="space-y-4">
        {topics.map((t) => (
          <div key={t.title}>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">{t.title}</h3>
            <p className="text-gray-600 dark:text-gray-400">{t.description}</p>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Video Panduan</h3>
        <div className="w-full aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
          <iframe
            className="w-full h-full"
            src="https://www.youtube.com/embed/"
            title="Panduan"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}
