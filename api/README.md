# 📦 SEMAKIN 6502 API

Backend resmi aplikasi **SEMAKIN 6502** dibangun dengan **NestJS**, **Prisma ORM**, dan **MySQL**. Layanan ini menyediakan otentikasi berbasis JWT, manajemen kegiatan, pelaporan harian, serta berbagai endpoint monitoring kinerja pegawai.

## Teknologi Utama

- Node.js + NestJS
- Prisma ORM (MySQL)
- JWT Authentication dengan Role Based Access Control
- Scheduler untuk notifikasi otomatis
- Rate limiting dengan `@nestjs/throttler`

## Struktur Direktori

```
api/
├── src/
│   ├── auth/            # login & manajemen token
│   ├── users/           # manajemen pengguna
│   ├── teams/           # data tim dan anggotanya
│   ├── kegiatan/        # master kegiatan & penugasan
│   ├── laporan/         # laporan harian & tugas tambahan
│   ├── monitoring/      # rekap harian/mingguan/bulanan
│   ├── notifications/   # notifikasi in-app
│   ├── common/          # utilitas & guard bersama
│   └── main.ts          # entrypoint aplikasi
├── prisma/
│   ├── schema.prisma    # skema database
│   └── seed.ts          # script seeding data dummy
└── test/                # unit & integration test
```

## Persiapan & Instalasi

1. **Instal dependensi**
   ```bash
   cd api
   npm install
   ```
2. **Konfigurasi variabel lingkungan** (`.env`)

   | Nama               | Keterangan                                                                     |
   |--------------------|---------------------------------------------------------------------------------|
   | `DATABASE_URL`     | URL koneksi MySQL, misal `mysql://user:pass@localhost:3306/semakin_6502`        |
   | `JWT_SECRET`       | *Required.* Rahasia untuk penandatanganan JWT                                   |
   | `PORT`             | Port HTTP (opsional, default `3000`)                                           |
   | `CORS_ORIGIN`      | Daftar origin yang diizinkan, pisahkan dengan koma                             |
   | `THROTTLE_TTL`     | Masa berlaku rate limiting dalam detik (opsional, default `900`)               |
   | `THROTTLE_LIMIT`   | Jumlah request per TTL (opsional, default `100`)                               |
   | `COOKIE_DOMAIN`    | Domain cookie (opsional)                                                       |
   | `COOKIE_SAMESITE`  | Nilai SameSite cookie (opsional)                                               |

3. **Inisialisasi database**
   ```bash
   npx prisma generate
   npx prisma db push
   npm run seed   # memuat data dummy & pengguna demo
   ```
4. **Menjalankan server development**
   ```bash
   npm run start:dev
   ```
   Backend akan tersedia di `http://localhost:3000` (atau sesuai `PORT`).

## Skrip NPM Penting

| Perintah            | Fungsi                             |
|--------------------|------------------------------------|
| `npm run start:dev`| Menjalankan server NestJS dengan reload otomatis |
| `npm run build`    | Membangun berkas produksi di `dist/` |
| `npm run start`    | Menjalankan server dari hasil build  |
| `npm test`         | Menjalankan semua unit test          |
| `npm run lint`     | Menjalankan ESLint                   |
| `npm run seed`     | Menjalankan Prisma seed              |

## Otentikasi & Role

Aplikasi menggunakan JWT yang dikirim via cookie dan header Authorization. Setiap pengguna memiliki salah satu role berikut:

| Role        | Akses utama                                                |
|-------------|------------------------------------------------------------|
| `admin`     | CRUD user & tim, akses penuh monitoring                     |
| `pimpinan`  | Membaca seluruh monitoring                                 |
| `ketua_tim` | Mengelola kegiatan, penugasan, monitoring tim               |
| `anggota`   | Mengisi laporan harian & tugas tambahan                    |

## Rate Limiting

Rate limit global diterapkan dengan `@nestjs/throttler`. Defaultnya 100 request per 15 menit per alamat IP. Nilai dapat diubah melalui `THROTTLE_TTL` dan `THROTTLE_LIMIT` pada `.env`.

## Endpoint Penting

| Method | Endpoint                     | Deskripsi                                        |
|--------|------------------------------|--------------------------------------------------|
| GET    | `/health`                    | Mengecek status server                           |
| POST   | `/auth/login`                | Login pengguna (`identifier`, `password`)        |
| GET    | `/users`                     | Daftar semua pengguna                            |
| GET    | `/teams`                     | Daftar tim                                       |
| POST   | `/master-kegiatan`           | Menambah master kegiatan                         |
| POST   | `/penugasan`                 | Memberi penugasan ke anggota                     |
| POST   | `/laporan-harian`            | Mengirim laporan harian                          |
| POST   | `/tugas-tambahan`            | Mengirim laporan tugas tambahan                  |
| GET    | `/monitoring/harian`         | Monitoring harian                                |
| GET    | `/monitoring/mingguan/all`   | Monitoring mingguan semua pegawai               |
| GET    | `/monitoring/bulanan/all`    | Monitoring bulanan semua pegawai                |
| GET    | `/monitoring/laporan/terlambat` | Daftar pegawai yang terlambat membuat laporan |

## Zona Waktu

Seluruh perhitungan tanggal mengasumsikan server berjalan pada zona waktu **UTC**. Kirim tanggal dalam format `YYYY-MM-DD` agar Node.js mem-parsing sebagai UTC.

## Pengujian

Jalankan seluruh unit test dengan:
```bash
npm test
```

## Lisensi

MIT License – silakan menggunakan atau memodifikasi dengan menyertakan atribusi.
