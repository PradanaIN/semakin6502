# SEMAKIN 6502

SEMAKIN 6502 (Sistem Evaluasi dan Monitoring Kinerja) is an internal tool for tracking daily activities and monitoring team performance.

This repository contains both the backend API and the frontend web application.

## Projects

- **api/** – NestJS backend using Prisma and MySQL. Details and full installation instructions are available in [api/README.md](api/README.md).
- **web/** – React + Vite frontend. Usage notes are provided in [web/README.md](web/README.md).

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd semakin6502
   ```
2. **Install dependencies**
   ```bash
   cd api && npm install
   # optional: run tests
   npm test
   cd ../web && npm install
   ```
3. **Configure environment variables** following the examples in each subproject.
4. **Run the development servers**
   ```bash
   cd api && npm run start:dev
   # in a second terminal
   cd ../web && npm run dev
   ```

Check each subproject README for detailed configuration and feature descriptions.


## Docker Compose

A `docker-compose.yml` file is provided to start all services with a single command.
Make sure Docker and Docker Compose are installed and then run:

```bash
docker-compose up --build
```

The backend is available at `http://localhost:3000` and the frontend at `http://localhost:5173`.
MySQL data persists in the `mysql-data` volume and is initialized from `docker/mysql/init.sql`.

## Naming Conventions

Code and database fields use **camelCase**. When adding new API DTOs or Prisma models, prefer English terms and camelCase naming (e.g. `teamId`, `namaKegiatan`). Legacy snake_case columns remain for compatibility but new contributions should avoid them.

