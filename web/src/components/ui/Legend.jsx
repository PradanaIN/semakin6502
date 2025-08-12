export default function Legend({ className = "" }) {
  return (
    <div
      className={`flex flex-wrap justify-end gap-2 text-xs text-gray-500 dark:text-gray-400 ${className}`.trim()}
    >
      <div className="flex items-center gap-1">
        <span className="inline-block w-3 h-3 bg-green-400 rounded-sm"></span>
        Ada Laporan
      </div>
      <div className="flex items-center gap-1">
        <span className="inline-block w-3 h-3 bg-yellow-400 rounded-sm"></span>
        Tidak Ada
      </div>
      <div className="flex items-center gap-1">
        <span className="inline-block w-3 h-3 bg-blue-400 rounded-sm"></span>
        Akhir Pekan/Libur
      </div>
    </div>
  );
}
