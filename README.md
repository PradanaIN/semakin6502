# SEMAKIN 6502

SEMAKIN 6502 (Sistem Evaluasi dan Monitoring Kinerja) adalah aplikasi internal untuk mencatat aktivitas harian pegawai, memberi tugas mingguan maupun tambahan, serta menampilkan rekap kinerja bagi pimpinan.

Repositori ini merupakan **monorepo** yang berisi dua proyek utama:

- **api/** – backend NestJS + Prisma + MySQL.
- **web/** – frontend React + Vite + Tailwind.
- **docker/** – skrip dan konfigurasi docker-compose untuk menjalankan stack secara terintegrasi.

## Prasyarat

- [Node.js](https://nodejs.org/) ≥ 18
- [npm](https://www.npmjs.com/) (terpasang bersama Node.js)
- [MySQL](https://www.mysql.com/) 8 untuk menjalankan backend secara lokal
- [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/) (opsional, jika ingin menjalankan melalui kontainer)

## Struktur Direktori

```
semakin6502/
├── api/            # Backend NestJS
├── web/            # Frontend React + Vite
├── docker/         # Konfigurasi Docker & skrip inisialisasi
├── docker-compose.yml
└── README.md
```

## Memulai Pengembangan Lokal

1. **Kloning repositori**
   ```bash
   git clone <repo-url>
   cd semakin6502
   ```
2. **Instal dependensi**
   ```bash
   cd api && npm install
   cd ../web && npm install
   ```
3. **Konfigurasi environment** sesuai dengan contoh yang terdapat pada masing‑masing subproyek (`api/.env` dan `web/.env`).
4. **Menjalankan server pengembangan**
   ```bash
   # Terminal 1 – backend
   cd api
   npm run start:dev

   # Terminal 2 – frontend
   cd web
   npm run dev
   ```
5. **Pengujian**
   ```bash
   cd api && npm test
   cd ../web && npm test
   ```

Backend akan berjalan pada `http://localhost:3000` dan frontend pada `http://localhost:5173`.

## Menjalankan dengan Docker

Semua layanan dapat dijalankan menggunakan Docker Compose. Pastikan Docker telah terinstal, kemudian jalankan:

```bash
docker-compose up --build
```

Docker akan menyiapkan kontainer API, web, dan MySQL. Data MySQL tersimpan pada volume `mysql-data` dan akan diinisialisasi oleh skrip `docker/mysql/init.sql`.

## Kontribusi

1. Fork proyek ini
2. Buat branch fitur: `git checkout -b feature/nama-fitur`
3. Ajukan pull request ke repo utama

## Lisensi

Proyek ini dirilis dengan lisensi [MIT](LICENSE).
