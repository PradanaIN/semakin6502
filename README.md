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

## Install Dependencies

Make sure you have **Node.js** and **npm** installed. The API also requires a running **MySQL** instance.

```bash
cd api && npm install
cd ../web && npm install
```

## Running Backend Tests

Execute the Jest test suite inside the `api` folder:

```bash
cd api && npm test
```

## Linting

Run ESLint for either project:

```bash
cd api && npm run lint
# or
cd ../web && npm run lint
```

## Building

Compile the backend and build the frontend for production:

```bash
cd api && npm run build
cd ../web && npm run build
```

## Environment Variables

The API expects a `.env` file with settings such as `DATABASE_URL` and `JWT_SECRET`. The frontend reads `VITE_API_URL` from `.env` (see `web/.env.example`). Refer to each subproject README for full examples.
