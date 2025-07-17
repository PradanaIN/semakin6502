import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import MONTHS from "../common/months";
import { STATUS } from "../common/status.constants";

@Injectable()
export class MonitoringService {
  constructor(private readonly prisma: PrismaService) {}
  async harian(tanggal: string, teamId?: number, userId?: number) {
    const base = new Date(tanggal);
    if (isNaN(base.getTime()))
      throw new BadRequestException("tanggal tidak valid");

    const year = base.getFullYear();
    const month = base.getMonth();

    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);

    const where: any = { tanggal: { gte: start, lte: end } };
    if (userId) where.pegawaiId = userId;
    if (teamId)
      where.penugasan = {
        kegiatan: { teamId },
      };

    const records = await this.prisma.laporanHarian.findMany({
      where,
      select: { tanggal: true },
    });

    const exists = new Set(
      records.map((r: { tanggal: Date }) =>
        r.tanggal.toISOString().slice(0, 10),
      ),
    );

    const result = [] as { tanggal: string; adaKegiatan: boolean }[];
    for (let d = 1; d <= end.getDate(); d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
        d,
      ).padStart(2, "0")}`;
      result.push({ tanggal: dateStr, adaKegiatan: exists.has(dateStr) });
    }
    return result;
  }

  async mingguan(minggu: string, teamId?: number, userId?: number) {
    const start = new Date(minggu);
    const offset = (start.getDay() + 6) % 7; // days since Monday
    start.setDate(start.getDate() - offset);
    if (isNaN(start.getTime()))
      throw new BadRequestException("minggu tidak valid");

    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    const where: any = { tanggal: { gte: start, lte: end } };
    if (userId) where.pegawaiId = userId;
    if (teamId)
      where.penugasan = {
        kegiatan: { teamId },
      };

    const records = await this.prisma.laporanHarian.findMany({
      where,
      select: { tanggal: true, status: true },
    });

    const perDay: Record<string, { selesai: number; total: number }> = {};
    for (const r of records) {
      const dateStr = r.tanggal.toISOString().slice(0, 10);
      if (!perDay[dateStr]) perDay[dateStr] = { selesai: 0, total: 0 };
      perDay[dateStr].total += 1;
      if (r.status === STATUS.SELESAI_DIKERJAKAN)
        perDay[dateStr].selesai += 1;
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
      minggu: getWeekOfMonth(start),
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

  async bulanan(year: string, teamId?: number, userId?: number) {
    const yr = parseInt(year, 10);
    if (isNaN(yr)) throw new BadRequestException("year tidak valid");

    const results = [] as { bulan: string; persen: number }[];

    for (let i = 0; i < MONTHS.length; i++) {
      const first = new Date(Date.UTC(yr, i, 1));
      const weeks = await this.penugasanBulan(
        first.toISOString().slice(0, 10),
        teamId,
        userId,
      );

      if (weeks.length === 0) {
        results.push({ bulan: MONTHS[i], persen: 0 });
        continue;
      }

      const bulanAvg =
        weeks.reduce((sum, w) => sum + w.persen, 0) / weeks.length;
      results.push({ bulan: MONTHS[i], persen: Math.round(bulanAvg) });
    }

    return results;
  }

  async harianBulan(tanggal: string, teamId?: number) {
    const base = new Date(tanggal);
    if (isNaN(base.getTime()))
      throw new BadRequestException("tanggal tidak valid");

    const year = base.getFullYear();
    const month = base.getMonth();

    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);

    const where: any = { tanggal: { gte: start, lte: end } };
    if (teamId)
      where.penugasan = {
        kegiatan: { teamId },
      };

    const records = await this.prisma.laporanHarian.findMany({
      where,
      include: { pegawai: true },
    });

    const byUser: Record<number, { nama: string; dates: Set<string> }> = {};
    for (const r of records) {
      const dateStr = r.tanggal.toISOString().slice(0, 10);
      if (!byUser[r.pegawaiId])
        byUser[r.pegawaiId] = { nama: r.pegawai.nama, dates: new Set() };
      byUser[r.pegawaiId].dates.add(dateStr);
    }

    return Object.entries(byUser)
      .map(([id, v]) => {
        const detail = [] as { tanggal: string; adaKegiatan: boolean }[];
        for (let d = 1; d <= end.getDate(); d++) {
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
            d,
          ).padStart(2, "0")}`;
          detail.push({ tanggal: dateStr, adaKegiatan: v.dates.has(dateStr) });
        }
        return { userId: Number(id), nama: v.nama, detail };
      })
      .sort((a, b) => a.nama.localeCompare(b.nama));
  }

  async harianAll(tanggal: string, teamId?: number) {
    const date = new Date(tanggal);
    if (isNaN(date.getTime()))
      throw new BadRequestException("tanggal tidak valid");

    const where: any = { tanggal: date };
    if (teamId)
      where.penugasan = {
        kegiatan: { teamId },
      };

    const records = await this.prisma.laporanHarian.findMany({
      where,
      include: { pegawai: true },
    });

    const byUser: Record<
      number,
      { nama: string; selesai: number; total: number }
    > = {};

    for (const r of records) {
      if (!byUser[r.pegawaiId])
        byUser[r.pegawaiId] = { nama: r.pegawai.nama, selesai: 0, total: 0 };
      byUser[r.pegawaiId].total += 1;
      if (r.status === STATUS.SELESAI_DIKERJAKAN) byUser[r.pegawaiId].selesai += 1;
    }

    return Object.entries(byUser)
      .map(([id, v]) => ({
        userId: Number(id),
        nama: v.nama,
        selesai: v.selesai,
        total: v.total,
        persen: v.total ? Math.round((v.selesai / v.total) * 100) : 0,
      }))
      .sort((a, b) => a.nama.localeCompare(b.nama));
  }

  async mingguanAll(minggu: string, teamId?: number) {
    const start = new Date(minggu);
    const offset = (start.getDay() + 6) % 7;
    start.setDate(start.getDate() - offset);
    if (isNaN(start.getTime()))
      throw new BadRequestException("minggu tidak valid");

    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    const where: any = { tanggal: { gte: start, lte: end } };
    if (teamId)
      where.penugasan = {
        kegiatan: { teamId },
      };

    const records = await this.prisma.laporanHarian.findMany({
      where,
      include: { pegawai: true },
    });

    const byUser: Record<
      number,
      { nama: string; selesai: number; total: number }
    > = {};

    for (const r of records) {
      if (!byUser[r.pegawaiId])
        byUser[r.pegawaiId] = { nama: r.pegawai.nama, selesai: 0, total: 0 };
      byUser[r.pegawaiId].total += 1;
      if (r.status === STATUS.SELESAI_DIKERJAKAN) byUser[r.pegawaiId].selesai += 1;
    }

    return Object.entries(byUser)
      .map(([id, v]) => ({
        userId: Number(id),
        nama: v.nama,
        selesai: v.selesai,
        total: v.total,
        persen: v.total ? Math.round((v.selesai / v.total) * 100) : 0,
      }))
      .sort((a, b) => a.nama.localeCompare(b.nama));
  }

  async mingguanBulan(tanggal: string, teamId?: number) {
    const base = new Date(tanggal);
    if (isNaN(base.getTime()))
      throw new BadRequestException("tanggal tidak valid");

    const year = base.getFullYear();
    const month = base.getMonth();

    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);

    const firstMonday = new Date(monthStart);
    firstMonday.setDate(monthStart.getDate() - ((monthStart.getDay() + 6) % 7));
    const weekStarts: Date[] = [];
    for (let d = new Date(firstMonday); d <= monthEnd; d.setDate(d.getDate() + 7)) {
      weekStarts.push(new Date(d));
    }

    const where: any = { tanggal: { gte: monthStart, lte: monthEnd } };
    if (teamId)
      where.penugasan = {
        kegiatan: { teamId },
      };

    const records = await this.prisma.laporanHarian.findMany({
      where,
      include: { pegawai: true },
    });

    const byUser: Record<
      number,
      {
        nama: string;
        perWeek: Record<number, { selesai: number; total: number }>;
      }
    > = {};

    for (const r of records) {
      const idx = Math.floor(
        (r.tanggal.getTime() - weekStarts[0].getTime()) / (7 * 24 * 60 * 60 * 1000),
      );
      if (!byUser[r.pegawaiId])
        byUser[r.pegawaiId] = { nama: r.pegawai.nama, perWeek: {} };
      if (!byUser[r.pegawaiId].perWeek[idx])
        byUser[r.pegawaiId].perWeek[idx] = { selesai: 0, total: 0 };
      byUser[r.pegawaiId].perWeek[idx].total += 1;
      if (r.status === STATUS.SELESAI_DIKERJAKAN)
        byUser[r.pegawaiId].perWeek[idx].selesai += 1;
    }

    return Object.entries(byUser)
      .map(([id, v]) => {
        const weeks = weekStarts.map((_, i) => {
          const w = v.perWeek[i] || { selesai: 0, total: 0 };
          const persen = w.total ? Math.round((w.selesai / w.total) * 100) : 0;
          return { selesai: w.selesai, total: w.total, persen };
        });
        return { userId: Number(id), nama: v.nama, weeks };
      })
      .sort((a, b) => a.nama.localeCompare(b.nama));
  }

  async penugasanMinggu(
    minggu: string,
    teamId?: number,
    userId?: number,
  ) {
    const start = new Date(minggu);
    const offset = (start.getDay() + 6) % 7;
    start.setDate(start.getDate() - offset);
    if (isNaN(start.getTime()))
      throw new BadRequestException("minggu tidak valid");

    const where: any = {
      minggu: getWeekOfMonth(start),
      bulan: String(start.getMonth() + 1),
      tahun: start.getFullYear(),
    };
    if (teamId) where.kegiatan = { teamId };
    if (userId) where.pegawaiId = userId;

    const tugas = await this.prisma.penugasan.findMany({
      where,
      select: { status: true },
    });

    let selesai = 0;
    let belum = 0;
    for (const t of tugas) {
      if (t.status === STATUS.SELESAI_DIKERJAKAN) selesai += 1;
      if (t.status === STATUS.BELUM || t.status === STATUS.SEDANG_DIKERJAKAN)
        belum += 1;
    }

    return { total: tugas.length, selesai, belum };
  }

  async penugasanBulan(
    tanggal: string,
    teamId?: number,
    userId?: number,
  ) {
    const base = new Date(tanggal);
    if (isNaN(base.getTime()))
      throw new BadRequestException("tanggal tidak valid");

    const year = base.getFullYear();
    const month = base.getMonth();

    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);

    const firstMonday = new Date(monthStart);
    firstMonday.setDate(monthStart.getDate() - ((monthStart.getDay() + 6) % 7));
    const weekStarts: Date[] = [];
    for (let d = new Date(firstMonday); d <= monthEnd; d.setDate(d.getDate() + 7)) {
      weekStarts.push(new Date(d));
    }

    const where: any = {
      tahun: year,
      bulan: String(month + 1),
    };
    if (teamId) where.kegiatan = { teamId };
    if (userId) where.pegawaiId = userId;

    const tugas = await this.prisma.penugasan.findMany({
      where,
      select: { minggu: true, status: true },
    });

    const perWeek: Record<number, { selesai: number; total: number }> = {};
    for (const t of tugas) {
      const idx = t.minggu - 1;
      if (!perWeek[idx]) perWeek[idx] = { selesai: 0, total: 0 };
      perWeek[idx].total += 1;
      if (t.status === STATUS.SELESAI_DIKERJAKAN) perWeek[idx].selesai += 1;
    }

    return weekStarts.map((_, i) => {
      const w = perWeek[i] || { selesai: 0, total: 0 };
      const persen = w.total ? Math.round((w.selesai / w.total) * 100) : 0;
      return { minggu: i + 1, selesai: w.selesai, total: w.total, persen };
    });
  }

  async bulananAll(year: string, teamId?: number, bulan?: string) {
    const yr = parseInt(year, 10);
    if (isNaN(yr)) throw new BadRequestException("year tidak valid");

    const where: any = { tahun: yr };
    if (bulan) {
      const bln = parseInt(bulan, 10);
      if (isNaN(bln) || bln < 1 || bln > 12)
        throw new BadRequestException("bulan tidak valid");
      where.bulan = String(bln);
    }
    if (teamId) where.kegiatan = { teamId };

    const tugas = await this.prisma.penugasan.findMany({
      where,
      include: { pegawai: true },
    });

    const byUser: Record<
      number,
      { nama: string; selesai: number; total: number }
    > = {};

    for (const t of tugas) {
      if (!byUser[t.pegawaiId])
        byUser[t.pegawaiId] = { nama: t.pegawai.nama, selesai: 0, total: 0 };
      byUser[t.pegawaiId].total += 1;
      if (t.status === STATUS.SELESAI_DIKERJAKAN) byUser[t.pegawaiId].selesai += 1;
    }

    return Object.entries(byUser)
      .map(([id, v]) => ({
        userId: Number(id),
        nama: v.nama,
        selesai: v.selesai,
        total: v.total,
        persen: v.total ? Math.round((v.selesai / v.total) * 100) : 0,
      }))
      .sort((a, b) => a.nama.localeCompare(b.nama));
  }

  async bulananMatrix(year: string, teamId?: number) {
    const yr = parseInt(year, 10);
    if (isNaN(yr)) throw new BadRequestException("year tidak valid");

    const where: any = { tahun: yr };
    if (teamId) where.kegiatan = { teamId };

    const tugas = await this.prisma.penugasan.findMany({
      where,
      include: { pegawai: true },
    });

    const byUser: Record<
      number,
      { nama: string; perMonth: Record<number, { selesai: number; total: number }> }
    > = {};

    for (const t of tugas) {
      const idx = parseInt(t.bulan, 10) - 1;
      if (!byUser[t.pegawaiId])
        byUser[t.pegawaiId] = { nama: t.pegawai.nama, perMonth: {} };
      if (!byUser[t.pegawaiId].perMonth[idx])
        byUser[t.pegawaiId].perMonth[idx] = { selesai: 0, total: 0 };
      byUser[t.pegawaiId].perMonth[idx].total += 1;
      if (t.status === STATUS.SELESAI_DIKERJAKAN)
        byUser[t.pegawaiId].perMonth[idx].selesai += 1;
    }

    return Object.entries(byUser)
      .map(([id, v]) => {
        const months = MONTHS.map((_, i) => {
          const m = v.perMonth[i] || { selesai: 0, total: 0 };
          const persen = m.total ? Math.round((m.selesai / m.total) * 100) : 0;
          return { selesai: m.selesai, total: m.total, persen };
        });
        return { userId: Number(id), nama: v.nama, months };
      })
      .sort((a, b) => a.nama.localeCompare(b.nama));
  }
}

function monthName(date: Date) {
  return MONTHS[date.getMonth()];
}

function getWeekOfMonth(date: Date) {
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const offset = (first.getDay() + 6) % 7; // Monday-based
  return Math.floor((date.getDate() + offset - 1) / 7) + 1;
}
