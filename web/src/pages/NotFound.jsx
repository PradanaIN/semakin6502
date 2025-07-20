import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import Button from "../components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center space-y-6">
      <div className="flex flex-col items-center space-y-4 animate-fadeIn">
        <div className="bg-gradient-to-r from-blue-500 via-green-400 to-orange-400 p-4 rounded-full shadow-lg">
          <AlertTriangle className="text-white w-10 h-10" />
        </div>
        <h1 className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-green-500 to-orange-500">
          404 - Not Found
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-md">
          Maaf, halaman yang Anda cari tidak ditemukan.
        </p>
      </div>
      <Link to="/dashboard">
        <Button className="mt-4 hover:scale-105 transition-transform duration-300 focus:ring-2 focus:ring-offset-2 focus:ring-blue-400">
          Ke Dashboard
        </Button>
      </Link>
      <span className="text-xl">Halaman tidak ditemukan</span>
    </div>
  );
}
