import { Link } from "react-router-dom";
import Button from "../components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-4 p-6">
      <h1 className="text-4xl font-bold">404 - Not Found</h1>
      <p className="text-gray-600 dark:text-gray-400">
        Halaman yang Anda cari tidak ditemukan.
      </p>
      <Link to="/dashboard">
        <Button>Ke Dashboard</Button>
      </Link>
    </div>
  );
}
