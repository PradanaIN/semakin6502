# SEMAKIN 6502 – Dokumentasi Fitur Lengkap

SEMAKIN 6502 (Sistem Monitoring Kinerja) adalah aplikasi internal untuk mencatat aktivitas harian pegawai, memberi tugas mingguan maupun tambahan, serta menampilkan rekap kinerja bagi pimpinan.

## Instalasi

1. Salin berkas contoh `.env` (misalnya dari `api/.env.example`) ke direktori root sebagai `.env` dan sesuaikan variabel seperti kredensial database serta `PORT` dan `BACKEND_PORT` (bawaan 3000).
2. Jalankan `docker-compose up` untuk membangun dan menjalankan seluruh layanan.
3. Setelah kontainer berjalan, API dapat diakses di `http://localhost:${BACKEND_PORT}` (default `http://localhost:3000`) dan antarmuka web di `http://localhost:5173`.

## Deployment

1. Pastikan server sudah login ke registry yang menyimpan image, misalnya: `docker login ghcr.io`.
2. Jalankan `./deploy.sh` (menggunakan `docker-compose -f docker-compose.prod.yml pull && docker-compose -f docker-compose.prod.yml up -d`) untuk menarik image terbaru dan me-restart kontainer.
3. Untuk otomatisasi, Anda dapat memakai salah satu dari berikut:
   - **Watchtower** untuk memantau dan memperbarui image secara berkala.
   - **GitHub Actions**: workflow `deploy.yml` di repo ini akan mengeksekusi `deploy.sh` melalui SSH ketika image baru dipublikasikan.

## Peran & Hak Akses

| Peran        | Deskripsi Singkat                            |
| ------------ | -------------------------------------------- |
| **admin**    | Mengelola seluruh data & konfigurasi sistem. |
| **pimpinan** | Melihat ringkasan kinerja lintas tim.        |
| **ketua**    | Memimpin tim, membuat/menugaskan pekerjaan.  |
| **anggota**  | Mengisi laporan & menerima penugasan.        |

Sistem hanya mengenali keempat peran di atas.

## Konfigurasi Lingkungan

Beberapa pengaturan aplikasi dibaca dari berkas `.env`. Tambahkan entri berikut:

- `WEB_URL` (opsional) – URL dasar frontend untuk membentuk tautan pada notifikasi. Jika kosong, tautan WhatsApp dilewati.

## Alur Penggunaan Umum

1. **Admin** membuat tim dan akun pegawai.
2. **Ketua** menyiapkan _master kegiatan_ lalu memberi penugasan mingguan kepada anggota.
3. **Anggota** atau ketua mengisi _laporan harian_ atas penugasan atau tugas tambahan.
4. **Notifikasi** dikirim saat ada penugasan baru atau laporan selesai.
5. **Pimpinan** dan admin memantau progres melalui menu _Monitoring_.

---

## Fitur & Menu

### 1. Autentikasi

- **Tujuan**: Otentikasi pengguna melalui cookie JWT.
- **Akses**: Semua peran.
- **Cara Pakai**: `POST /auth/login` untuk masuk dan `POST /auth/logout` untuk keluar. Endpoint `GET /auth/me` mengembalikan profil pengguna saat ini.
- **Contoh Skenario**: Pegawai memasukkan kredensial di halaman login; token disimpan sebagai cookie.
- **Batasan**: Cookie bersifat HTTP-only; opsi _remember me_ menetapkan masa kedaluwarsa 30 hari.
- **Catatan Teknis**: Properti `COOKIE_DOMAIN`, `COOKIE_SAMESITE`, dan `NODE_ENV` memengaruhi konfigurasi cookie.

### 2. Manajemen Pengguna

- **Tujuan**: CRUD data pegawai dan pembaruan profil.
- **Akses**:
  - Admin: seluruh operasi.
  - Ketua: hanya dapat melihat daftar (`GET /users`).
  - Semua peran: melihat/memperbarui profil sendiri.
- **Alur**: Admin membuat pengguna → pengguna login → pengguna memperbarui profil via `PUT /users/profile` (role hanya dapat diubah oleh admin).
- **Contoh**: Admin menambahkan pegawai baru dengan role “anggota”.
- **Batasan**: Endpoint selain profil dilindungi oleh guard `RolesGuard`; hanya admin yang dapat menghapus pengguna.
- **Catatan Teknis**: Password di-hash melalui util `hash.ts`.

### 3. Manajemen Tim

- **Tujuan**: Menyusun tim kerja dan anggotanya.
- **Akses**:
  - Admin: CRUD tim dan anggota.
  - Ketua: Melihat tim yang dipimpinnya.
  - Anggota: Melihat tim yang diikutinya.
- **Alur**: Admin membuat tim → menambahkan anggota → ketua otomatis memiliki hak ketua jika `isLeader` bernilai true.
- **Contoh**: Admin menambahkan anggota baru ke tim A melalui `POST /teams/:id/members`.
- **Batasan**: Operasi selain `GET /teams`/`GET /teams/all` memerlukan peran admin.
- **Catatan Teknis**: Endpoint `GET /teams` mengembalikan seluruh tim bila role admin, atau hanya tim yang dipimpin jika role ketua.

### 4. Master Kegiatan

- **Tujuan**: Daftar master aktivitas sebagai dasar penugasan.
- **Akses**:
  - Admin & Ketua: membuat, memperbarui, menghapus.
  - Semua peran: melihat daftar.
- **Alur**: Ketua membuat master kegiatan (`POST /master-kegiatan`) → dapat difilter berdasarkan tim dan pencarian.
- **Contoh**: Ketua tim memasukkan “Menyusun Laporan Bulanan” ke master.
- **Batasan**: Perubahan membutuhkan otorisasi admin atau ketua.
- **Catatan Teknis**: ID menggunakan format ULID (lihat Prisma schema).

### 5. Penugasan Mingguan

- **Tujuan**: Menetapkan tugas mingguan dari master kegiatan kepada pegawai.
- **Akses**:
  - Admin atau ketua tim: membuat, memperbarui, menghapus.
  - Semua peran: melihat penugasan yang relevan.
- **Alur**:
  1. Ketua memilih master kegiatan & anggota.
  2. Sistem mengirim notifikasi kepada anggota.
  3. Anggota mengisi laporan harian terkait.
- **Contoh**: Ketua menugaskan tiga anggota sekaligus via `POST /penugasan/bulk`.
- **Batasan**:
  - Hanya admin atau ketua tim terkait yang boleh menugaskan.
  - Penugasan tak dapat dihapus jika sudah memiliki laporan harian.
- **Catatan Teknis**: Filter pencarian tersedia (`bulan`, `tahun`, `minggu`, `creator`).

### 6. Laporan Harian

- **Tujuan**: Mencatat progres harian dari penugasan atau tugas tambahan.
- **Akses**:
  - Admin/Ketua/Anggota: membuat, mengubah, menghapus laporan yang dimiliki.
  - Pimpinan: hanya melihat melalui menu monitoring.
- **Alur**: Pegawai memilih penugasan → mengisi capaian, deskripsi, bukti → sistem menyinkronkan status penugasan.
- **Contoh**: Anggota mengirim laporan status _selesai_ untuk tugas minggu ini.
- **Batasan**:
  - Pimpinan dilarang membuat atau memodifikasi laporan.
  - Server mengasumsikan timezone UTC untuk perhitungan tanggal.
- **Catatan Teknis**: Ekspor laporan tersedia dalam format XLSX (`GET /laporan-harian/mine/export`).

### 7. Tugas Tambahan

- **Tujuan**: Mencatat pekerjaan di luar penugasan mingguan.
- **Akses**:
  - Anggota/ketua/admin: menambah & memperbarui tugas tambahan sendiri.
  - Admin & pimpinan: melihat semua melalui `GET /tugas-tambahan/all`.
  - Ketua: melihat tugas tambahan timnya melalui `GET /tugas-tambahan/all?teamId=<idTim>`.
- **Alur**: Pengguna menambahkan tugas tambahan → mengisi laporan harian khusus jika ada perkembangan.
- **Contoh**: Anggota mencatat tugas mendadak “Membantu acara”.
- **Batasan**:
  - Tidak bisa dihapus bila sudah memiliki laporan harian.
  - Pimpinan tidak boleh menambahkan laporan tambahan.
- **Catatan Teknis**: Status tugas tambahan disinkronkan otomatis dengan laporan harian.

### 8. Monitoring Kinerja

- **Tujuan**: Menyajikan ringkasan aktivitas harian, mingguan, dan bulanan.
- **Akses**:
  - Admin & Pimpinan: melihat seluruh tim.
  - Ketua: melihat timnya dan, jika bukan ketua, hanya data sendiri.
- **Alur**:
  - Endpoint `GET /monitoring/harian`, `.../mingguan`, `.../bulanan` menerima parameter tanggal/minggu/tahun.
  - Sistem memvalidasi keanggotaan tim sebelum menampilkan data.
- **Contoh**: Pimpinan memeriksa laporan terlambat semua tim via `GET /monitoring/laporan/terlambat`.
- **Batasan**: Pengguna non-admin/pimpinan yang bukan anggota tim tertentu ditolak dengan error _Forbidden._
- **Catatan Teknis**: Endpoint `last-update` memberi cap waktu data terakhir.

### 9. Notifikasi

- **Tujuan**: Memberi informasi real‑time (misal penugasan baru, penugasan selesai).
- **Akses**: Semua pengguna terotentikasi.
- **Alur**: Sistem membuat notifikasi (`NotificationsService.create`) ketika penugasan dibuat atau selesai; pengguna menandainya sebagai telah dibaca.
- **Contoh**: Anggota menerima notifikasi “Penugasan baru dari Tim A”.
- **Batasan**: Notifikasi hanya dapat ditandai dibaca oleh pemiliknya.
- **Catatan Teknis**: Endpoint `POST /notifications/read-all` menandai seluruh notifikasi pengguna sebagai telah dibaca.

### 10. Profil & Dashboard

- **Tujuan**: Menyediakan halaman ringkasan dan pengaturan pribadi.
- **Akses**: Semua peran (konten dashboard berbeda sesuai role).
- **Contoh Skenario**: Ketika anggota login, dashboard menampilkan statistik laporan mingguan; pimpinan melihat tab monitoring.
- **Batasan**: Tidak ada.

---

## Contoh Skenario End-to-End

1. **Setup**Admin membuat tim “Tim A” dan menambahkan tiga anggota. Ketua ditandai sebagai `isLeader=true`.
2. **Penugasan Mingguan**Ketua membuat _master kegiatan_ “Penyusunan Laporan” lalu menugaskan dua anggota menggunakan fitur _bulk assign_.
3. **Pelaporan**Setiap hari anggota mengisi laporan. Sistem memperbarui status penugasan; ketua menerima notifikasi saat status menjadi selesai.
4. **Monitoring**Pimpinan membuka halaman monitoring mingguan untuk melihat progres semua tim dan daftar laporan terlambat.
5. **Tugas Tambahan**
   Salah satu anggota mencatat tugas tambahan “Bantu Workshop” dan mengirim laporan ketika selesai.

---

## Batasan Umum

- Perhitungan tanggal menggunakan zona waktu UTC; sesuaikan konfigurasi server jika diperlukan.
- ID utama menggunakan ULID sehingga tidak berurutan secara numerik.
- Penugasan atau tugas tambahan harus dihapus setelah seluruh laporan harian terkait dihapus.

## Catatan Teknis

- Backend dibangun dengan NestJS + Prisma + MySQL.
- Frontend menggunakan React 19, Vite, dan Tailwind.
- Pengujian unit tersedia untuk backend dan frontend (Jest/Testing Library).
- Middleware `JwtAuthGuard` dan `RolesGuard` menegakkan otentikasi dan otorisasi di semua endpoint utama.

---

Lisensi: [MIT](LICENSE).
