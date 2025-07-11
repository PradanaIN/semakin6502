import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

@Injectable()
export class MonitoringService {
  async harian(tanggal: string) {
    const base = new Date(tanggal);
    if (isNaN(base.getTime()))
      throw new BadRequestException("tanggal tidak valid");

    const year = base.getFullYear();
    const month = base.getMonth();

    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);

    const records = await prisma.laporanHarian.findMany({
      where: { tanggal: { gte: start, lte: end } },
      select: { tanggal: true }
    });

    const exists = new Set(
      records.map((r: { tanggal: Date }) => r.tanggal.toISOString().slice(0, 10))
    );

    const result = [] as { tanggal: string; adaKegiatan: boolean }[];
    for (let d = 1; d <= end.getDate(); d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
        d
      ).padStart(2, "0")}`;
      result.push({ tanggal: dateStr, adaKegiatan: exists.has(dateStr) });
    }
    return result;
  }

  async mingguan(minggu: string) {
    const start = new Date(minggu);
    if (isNaN(start.getTime()))
      throw new BadRequestException("minggu tidak valid");

    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    const records = await prisma.laporanHarian.findMany({
      where: { tanggal: { gte: start, lte: end } },
      select: { tanggal: true, status: true },
    });

    const perDay: Record<string, { selesai: number; total: number }> = {};
    for (const r of records) {
      const dateStr = r.tanggal.toISOString().slice(0, 10);
      if (!perDay[dateStr]) perDay[dateStr] = { selesai: 0, total: 0 };
      perDay[dateStr].total += 1;
      if (r.status === "Selesai Dikerjakan") perDay[dateStr].selesai += 1;
    }

    const hari = [
      "Minggu",
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
    ];

    const detail = [] as {
      hari: string;
      tanggal: string;
      selesai: number;
      total: number;
      persen: number;
    }[];

    let totalSelesai = 0;
    let totalTugas = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const dateStr = d.toISOString().slice(0, 10);
      const data = perDay[dateStr] || { selesai: 0, total: 0 };
      const persen = data.total
        ? Math.round((data.selesai / data.total) * 100)
        : 0;
      detail.push({
        hari: hari[d.getDay()],
        tanggal: dateStr,
        selesai: data.selesai,
        total: data.total,
        persen,
      });
      totalSelesai += data.selesai;
      totalTugas += data.total;
    }

    const totalProgress = totalTugas
      ? Math.round((totalSelesai / totalTugas) * 100)
      : 0;

    return {
      minggu: getWeekNumber(start),
      bulan: monthName(start),
      tanggal: `${start.toISOString().slice(0, 10)} - ${end
        .toISOString()
        .slice(0, 10)}`,
      totalProgress,
      totalSelesai,
      totalTugas,
      detail,
    };
  }

  async bulanan(bulan: string) {
    const year = parseInt(bulan, 10);
    if (isNaN(year)) throw new BadRequestException("bulan tidak valid");

    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31);

    const harian = await prisma.laporanHarian.findMany({
      where: { tanggal: { gte: start, lte: end } },
      select: { tanggal: true }
    });

    const tambahan = await prisma.kegiatanTambahan.findMany({
      where: { tanggal: { gte: start, lte: end } },
      select: { tanggal: true },
    });

    const monthsWithActivity = new Set(
      [...harian, ...tambahan].map((r) => r.tanggal.getMonth())
    );

    const monthNames = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];

    return monthNames.map((name, idx) => ({
      tanggal: name,
      adaAktivitas: monthsWithActivity.has(idx),
    }));
  }
}

function monthName(date: Date) {
  const names = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  return names[date.getMonth()];
}

function getWeekNumber(d: Date) {
  const start = new Date(d.getFullYear(), 0, 1);
  const diff = (d.getTime() - start.getTime()) / 86400000;
  return Math.ceil((diff + start.getDay() + 1) / 7);
}
