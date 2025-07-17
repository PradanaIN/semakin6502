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
