import { useEffect, useState } from "react";
import axios from "axios";
import DataTable from "../../components/ui/DataTable";
import StatusBadge from "../../components/ui/StatusBadge";
import TableSkeleton from "../../components/ui/TableSkeleton";

export default function WeeklyTasksPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const today = new Date().toISOString().slice(0, 10);
        const res = await axios.get("/penugasan/minggu/all", { params: { minggu: today } });
        const list = [];
        (res.data || []).forEach((u) => {
          u.tugas.forEach((t) => {
            list.push({
              nama: u.nama,
              tugas: t.tugas,
              deskripsi: t.deskripsi,
              status: t.status,
            });
          });
        });
        setRows(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const columns = [
    { Header: "No", accessor: (_r, i) => i + 1, disableFilters: true },
    { Header: "Nama Pegawai", accessor: "nama", disableFilters: true },
    { Header: "Tugas", accessor: "tugas", disableFilters: true },
    { Header: "Deskripsi", accessor: "deskripsi", disableFilters: true },
    {
      Header: "Status",
      accessor: "status",
      Cell: ({ row }) => <StatusBadge status={row.original.status} />,
      disableFilters: true,
    },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Tugas Minggu Ini</h1>
      {loading ? (
        <TableSkeleton cols={columns.length} />
      ) : (
        <DataTable
          columns={columns}
          data={rows}
          showGlobalFilter={false}
          showPagination={false}
          selectable={false}
          emptyMessage="Belum ada tugas"
        />
      )}
    </div>
  );
}
