# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Environment Variables

Create a `.env` file based on `.env.example` and set the API base URL used by axios:

```bash
cp .env.example .env
```

The variable is accessed via `import.meta.env`:

```
VITE_API_URL=http://localhost:3000
```

Adjust the URL if your backend runs on a different host/port.

## Monitoring

The monitoring page is available at the route `/monitoring` and can be opened by
users with the **admin**, **ketua tim**, or **pimpinan** roles. It shows overall
progress for all users using progress bars in three tabs:

- **Daily** – progress for a selected date
- **Weekly** – progress for a selected week
- **Yearly** – monthly progress for a chosen year

The Daily tab also includes a scrollable matrix table showing each user's activity for every day in the chosen month. Cells are color coded just like in the dashboard overview:

- **Hijau** – ada tugas pada hari tersebut
- **Kuning** – tidak ada tugas
- **Biru** – akhir pekan atau hari libur

When filtering results by team you may supply optional query parameters such as
`teamId` to limit the data to a specific team.

## DataTable Component

Reusable tables are built with `react-table` through the `DataTable` component
located in `src/components/ui`. It provides:

- Global search across all columns
- Optional per-column filters
- Built-in pagination with a page size selector

Example usage:

```jsx
import DataTable, { SelectColumnFilter } from "./components/ui/DataTable";

const columns = [
  { Header: "Name", accessor: "name" },
  { Header: "Role", accessor: "role", Filter: SelectColumnFilter },
];

<DataTable columns={columns} data={data} />;
```
