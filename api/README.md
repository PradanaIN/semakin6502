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
Buat file `.env` dan isi:
```
DATABASE_URL="mysql://root:password@localhost:3306/semakin_6502"
JWT_SECRET="supersecretjwtkey"
```

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

| Role     | Akses                                                                 |
|----------|------------------------------------------------------------------------|
| admin    | CRUD user, CRUD tim, monitoring                                        |
| pimpinan | Melihat monitoring semua                                               |
| ketua    | CRUD master kegiatan, assign penugasan, monitoring tim-nya             |
| anggota  | Mengisi laporan harian, kegiatan tambahan                              |

---

## 📬 Endpoint Penting

| Method | Endpoint                   | Deskripsi                    | Role     |
|--------|----------------------------|------------------------------|----------|
| POST   | `/auth/login`              | Login user & dapatkan token  | semua    |
| GET    | `/users`                   | Lihat semua user             | admin    |
| GET    | `/teams`                   | Daftar tim                   | admin    |
| POST   | `/master-kegiatan`         | Tambah kegiatan              | ketua    |
| POST   | `/penugasan`               | Assign penugasan             | ketua    |
| POST   | `/laporan-harian`          | Laporan kegiatan harian      | anggota  |
| POST   | `/kegiatan-tambahan`       | Laporan kegiatan tambahan    | anggota  |
| GET    | `/monitoring/harian`       | Monitoring harian            | semua    |

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