import React from "react";
import { Link } from "react-router-dom";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Uncaught error:", error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-full flex flex-col items-center justify-center px-6 text-center space-y-5 bg-white dark:bg-gray-900 overflow-hidden isolate z-50">
          <div className="text-red-500 text-6xl">⚠️</div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Terjadi Kesalahan
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-md">
            Maaf, ada masalah saat memuat halaman. Cobalah untuk memuat ulang
            atau kembali ke beranda.
          </p>

          <div className="flex flex-wrap justify-center gap-3 pt-4">
            <button
              onClick={this.handleReload}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow-sm transition"
            >
              Muat Ulang
            </button>
            <Link to="/dashboard">
              <button className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-100 px-4 py-2 rounded-lg font-semibold shadow-sm transition">
                Kembali ke Beranda
              </button>
            </Link>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
