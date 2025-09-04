# 🌐 SEMAKIN 6502 Web

Frontend resmi SEMAKIN 6502 dibangun menggunakan **React 19**, **Vite**, dan **Tailwind CSS**. Aplikasi ini menyediakan antarmuka bagi pegawai untuk mengisi laporan serta menampilkan monitoring kinerja bagi pimpinan.

## Teknologi Utama

- React 19 dengan Vite
- Tailwind CSS dan [shadcn/ui](https://ui.shadcn.com/)
- React Router Dom v7
- Axios untuk komunikasi API
- Jest + Testing Library untuk pengujian

## Struktur Direktori

```
web/
├── src/
│   ├── pages/         # halaman aplikasi
│   ├── components/    # komponen UI dan DataTable
│   ├── routes/        # konfigurasi routing
│   ├── hooks/         # custom hooks
│   ├── lib/, utils/   # helper umum
│   └── __tests__/     # unit test
├── public/            # aset statis
└── tailwind.config.js
```

## Persiapan & Instalasi

1. **Instal dependensi**
   ```bash
   cd web
   npm install
   ```
2. **Konfigurasi variabel lingkungan**
   File `.env` default mengarah ke backend container (`http://localhost:3002`).
   Untuk menjalankan frontend di luar Docker dengan backend lokal (`http://localhost:3000`), gunakan `.env.development`.
   Sebaliknya, konfigurasi `.env.docker` disediakan untuk lingkungan Docker.

   Variabel yang digunakan:

   | Nama          | Contoh nilai                 | Deskripsi                        |
   |---------------|------------------------------|----------------------------------|
   | `VITE_API_URL`| `http://localhost:3000`      | URL base API backend             |

   Catatan: Sesuaikan `VITE_API_URL` bila backend berjalan pada port lain.

3. **Menjalankan server development**
   ```bash
   npm run dev                   # menggunakan .env.development
   npm run dev -- --mode docker  # menggunakan .env.docker
   ```
   Aplikasi akan tersedia pada `http://localhost:5173`.

4. **Membangun untuk produksi**
   ```bash
   npm run build
   npm run preview  # meninjau hasil build
   ```

## Pengujian & Linting

```bash
npm test   # menjalankan unit test
npm run lint  # menjalankan ESLint
```

## Fitur Penting

### Monitoring
Halaman `/monitoring` menampilkan progres harian, mingguan, dan bulanan bagi pengguna dengan role **admin**, **ketua tim**, atau **pimpinan**. Tab harian menyediakan matriks bulanan yang menggambarkan aktivitas setiap pegawai.

### DataTable
Komponen `DataTable` (`src/components/ui/DataTable`) digunakan untuk membuat tabel dinamis dengan fitur:
- pencarian global dan filter per kolom
- paginasi dan sorting
- pemilihan baris opsional

### Notifikasi
Ikon lonceng di header menampilkan notifikasi terbaru. Pengguna dapat menandai seluruh notifikasi sebagai sudah dibaca atau membuka item tertentu untuk menuju halaman terkait.

## Lisensi

Dirilis di bawah lisensi [MIT](../LICENSE).
