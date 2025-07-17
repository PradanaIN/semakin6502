# 📦 SEMAKIN 6502 API (Backend)

Ini adalah backend resmi dari aplikasi **SEMAKIN 6502** (Sistem Evaluasi dan Monitoring Kinerja), dibangun dengan **NestJS**, **Prisma ORM**, dan **MySQL**.

---

## 🚀 Teknologi

- **Node.js** + **NestJS**
- **Prisma ORM** untuk akses database
- **MySQL** (database: `semakin_6502`)
- **JWT Authentication** dengan Role-Based Access Control
- Modular struktur (`/auth`, `/users`, `/teams`, dst)

---

## 📁 Struktur Folder

```
api/
├── src/
│   ├── auth/            # Login, JWT
│   ├── users/           # Manajemen pengguna
│   ├── teams/           # Tim & anggota tim
│   ├── kegiatan/        # Master kegiatan & penugasan
│   ├── laporan/         # Laporan harian & tambahan
│   ├── monitoring/      # Rekap kinerja (harian, mingguan, bulanan)
│   └── app.module.ts    # Modul utama
├── prisma/
│   ├── schema.prisma    # Skema Prisma (MySQL)
│   └── seed.ts          # Data dummy awal
├── .env                 # Konfigurasi DB & JWT
├── package.json
└── tsconfig.json
```

---

## ⚙️ Setup & Instalasi

1. **Clone repo**
```bash
git clone https://github.com/namauser/semakin-6502.git
cd semakin-6502/api
```

2. **Install dependencies**
```bash
npm install
```

3. **Konfigurasi environment**
Buat file `.env` dan isi (nilai `JWT_SECRET` wajib diisi, server akan gagal start jika kosong):
```
DATABASE_URL="mysql://root:password@localhost:3306/semakin_6502"
JWT_SECRET="your_jwt_secret_here"  # wajib diisi
```
Jika `JWT_SECRET` tidak diatur, aplikasi akan langsung keluar dengan error.

4. **Setup database**
```bash
npx prisma generate
npx prisma db push
```

5. **Seed data dummy**
```bash
npx tsc prisma/seed.ts
node prisma/seed.js
```

6. **Jalankan server**
```bash
npm run start:dev
```

Server berjalan di: `http://localhost:3000`

---

## 🔐 Role & Akses

| Role       | Akses sistem |
|------------|------------------------------------------------|
| admin      | CRUD user, CRUD tim, monitoring |
| pimpinan   | Melihat monitoring semua |
| ketua tim  | Mengelola kegiatan dan penugasan |
| anggota tim| Hak akses berdasarkan keanggotaan tim |

## 📬 Endpoint Penting

| Method | Endpoint                   | Deskripsi                    | Role     |
|--------|----------------------------|------------------------------|----------|
| POST   | `/auth/login`              | Login user & dapatkan token (body: `{ identifier, password }`) | semua    |
| GET    | `/users`                   | Lihat semua user             | admin    |
| GET    | `/teams`                   | Daftar tim                   | admin    |
| POST   | `/master-kegiatan`         | Tambah kegiatan              | ketua tim    |
| POST   | `/penugasan`               | Assign penugasan             | ketua tim    |
| POST   | `/laporan-harian`          | Laporan kegiatan harian      | anggota tim |
| POST   | `/tugas-tambahan`          | Laporan tugas tambahan       | anggota tim |
| GET    | `/monitoring/harian`       | Monitoring harian            | semua    |
| GET    | `/monitoring/harian/all`   | Monitoring harian semua pegawai (query: `tanggal`, `teamId` opsional) | admin, pimpinan, ketua tim |
| GET    | `/monitoring/harian/bulan` | Rekap harian sebulan penuh per pegawai (query: `tanggal`, `teamId` opsional) | admin, pimpinan, ketua tim |
| GET    | `/monitoring/mingguan/all` | Monitoring mingguan semua pegawai (query: `minggu`, `teamId` opsional) | admin, pimpinan, ketua tim |
| GET    | `/monitoring/mingguan/bulan` | Rekap mingguan per pegawai dalam sebulan (query: `tanggal`, `teamId` opsional) | admin, pimpinan, ketua tim |
| GET    | `/monitoring/bulanan/all`  | Monitoring bulanan semua pegawai (query: `year`, `bulan` opsional, `teamId` opsional) | admin, pimpinan, ketua tim |
| GET    | `/monitoring/bulanan/matrix` | Matriks bulanan per user (query: `year`, `teamId` opsional) | admin, pimpinan, ketua tim |

Format hasil: array per pengguna, masing-masing memiliki array 12 objek bulan.

---

## 🧪 Uji API

Gunakan Postman:
1. Login → dapatkan JWT token
2. Tambahkan `Authorization: Bearer <token>` pada setiap request selanjutnya

---

## 👥 Kontribusi

1. Fork project
2. Buat branch: `feature/nama-fitur`
3. Pull request

---

## 📄 Lisensi

MIT License — bebas digunakan dengan menyebut sumber.