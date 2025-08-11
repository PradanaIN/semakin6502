import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import MONTHS from "../common/months";
import { STATUS } from "../common/status.constants";
import { ROLES } from "../common/roles.constants";

// Tanggal pada service monitoring diasumsikan diproses dalam timezone UTC.

@Injectable()
export class MonitoringService {
  constructor(private readonly prisma: PrismaService) {}

  async lastUpdate() {
    const latest = await this.prisma.laporanHarian.findFirst({
      orderBy: { tanggal: 'desc' },
      select: { tanggal: true },
    });
    return latest?.tanggal || null;
  }
  async harian(tanggal: string, teamId?: string, userId?: string) {
    const base = new Date(tanggal);
    if (isNaN(base.getTime()))
      throw new BadRequestException("tanggal tidak valid");

    const year = base.getFullYear();
    const month = base.getMonth();

    const start = new Date(Date.UTC(year, month, 1));
    const end = new Date(Date.UTC(year, month + 1, 0));

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
      records.map((r: { tanggal: Date }) => r.tanggal.toISOString()),
    );

    const result = [] as { tanggal: string; adaKegiatan: boolean }[];
    for (let d = 1; d <= end.getUTCDate(); d++) {
      const date = new Date(Date.UTC(year, month, d));
      const dateStr = date.toISOString();
      result.push({ tanggal: dateStr, adaKegiatan: exists.has(dateStr) });
    }
    return result;
  }

  async mingguan(minggu: string, teamId?: string, userId?: string) {
    const targetDate = new Date(minggu);
    if (isNaN(targetDate.getTime()))
      throw new BadRequestException("minggu tidak valid");

    const mingguKe = getWeekOfMonth(targetDate);
    const bulan = String(targetDate.getMonth() + 1);
    const tahun = targetDate.getFullYear();

    const start = new Date(targetDate);
    const offset = (start.getUTCDay() + 6) % 7; // days since Monday
    start.setUTCDate(start.getUTCDate() - offset);

    const end = new Date(start);
    end.setUTCDate(start.getUTCDate() + 6);

    const laporanWhere: any = { tanggal: { gte: start, lte: end } };
    if (userId) laporanWhere.pegawaiId = userId;
    if (teamId)
      laporanWhere.penugasan = {
        kegiatan: { teamId },
      };

    const records = await this.prisma.laporanHarian.findMany({
      where: laporanWhere,
      select: { tanggal: true, status: true },
    });

    const tugasWhere: any = {
      minggu: mingguKe,
      bulan,
      tahun,
    };
    if (teamId) tugasWhere.kegiatan = { teamId };
    if (userId) tugasWhere.pegawaiId = userId;

    const tugas = await this.prisma.penugasan.findMany({
      where: tugasWhere,
      select: { status: true },
    });

    const perDay: Record<string, { selesai: number; total: number }> = {};
    for (const r of records) {
      const dateStr = r.tanggal.toISOString();
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

    const totalSelesai = tugas.filter(
      (t: { status: string }) => t.status === STATUS.SELESAI_DIKERJAKAN,
    ).length;
    const totalTugas = tugas.length;
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setUTCDate(start.getUTCDate() + i);
      const dateStr = d.toISOString();
      const data = perDay[dateStr] || { selesai: 0, total: 0 };
      const persen = data.total > 0 ? 100 : 0;
      detail.push({
        hari: hari[d.getUTCDay()],
        tanggal: dateStr,
        selesai: data.selesai,
        total: data.total,
        persen,
      });
    }

    const totalProgress = totalTugas
      ? Math.round((totalSelesai / totalTugas) * 100)
      : 0;

    return {
      minggu: mingguKe,
      bulan: monthName(targetDate),
      tanggal: `${start.toISOString()} - ${end.toISOString()}`,
      totalProgress,
      totalSelesai,
      totalTugas,
      detail,
    };
  }

  async bulanan(year: string, teamId?: string, userId?: string) {
    const yr = parseInt(year, 10);
    if (isNaN(yr)) throw new BadRequestException("year tidak valid");

    const results = [] as { bulan: string; persen: number }[];

    for (let i = 0; i < MONTHS.length; i++) {
      const first = new Date(Date.UTC(yr, i, 1));
      const weeks = await this.penugasanBulan(
        first.toISOString(),
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

  async harianBulan(tanggal: string, teamId?: string) {
    const base = new Date(tanggal);
    if (isNaN(base.getTime()))
      throw new BadRequestException("tanggal tidak valid");

    const year = base.getFullYear();
    const month = base.getMonth();

    const start = new Date(Date.UTC(year, month, 1));
    const end = new Date(Date.UTC(year, month + 1, 0));

    const where: any = {
      tanggal: { gte: start, lte: end },
      pegawai: {
        role: { notIn: [ROLES.ADMIN, ROLES.PIMPINAN] },
        NOT: { username: { startsWith: "demo" } },
      },
    };
    if (teamId)
      where.penugasan = {
        kegiatan: { teamId },
      };

    const records = await this.prisma.laporanHarian.findMany({
      where,
      include: { pegawai: true },
    });

    const userWhere: any = {
      role: { notIn: [ROLES.ADMIN, ROLES.PIMPINAN] },
      NOT: { username: { startsWith: "demo" } },
    };
    if (teamId) userWhere.members = { some: { teamId } };

    const users = await this.prisma.user.findMany({
      where: userWhere,
      select: { id: true, nama: true },
      orderBy: { nama: "asc" },
    });

    if (records.length === 0) {
      return users.map((u: { id: string; nama: string }) => {
        const detail = [] as { tanggal: string; count: number }[];
        for (let d = 1; d <= end.getUTCDate(); d++) {
          const date = new Date(Date.UTC(year, month, d));
          detail.push({ tanggal: date.toISOString(), count: 0 });
        }
        return { userId: u.id, nama: u.nama, detail };
      });
    }

    const byUser: Record<
      string,
      { nama: string; counts: Record<string, number> }
    > = {};

    for (const u of users) {
      byUser[u.id] = { nama: u.nama, counts: {} };
    }

    for (const r of records) {
      if (!byUser[r.pegawaiId]) continue;
      const dateStr = r.tanggal.toISOString();
      byUser[r.pegawaiId].counts[dateStr] =
        (byUser[r.pegawaiId].counts[dateStr] || 0) + 1;
    }

    return Object.entries(byUser)
      .map(([id, v]) => {
        const detail = [] as { tanggal: string; count: number }[];
        for (let d = 1; d <= end.getUTCDate(); d++) {
          const date = new Date(Date.UTC(year, month, d));
          const dateStr = date.toISOString();
          detail.push({
            tanggal: dateStr,
            count: v.counts[dateStr] || 0,
          });
        }
        return { userId: id, nama: v.nama, detail };
      })
      .sort((a, b) => a.nama.localeCompare(b.nama));
    }

  async harianAll(tanggal: string, teamId?: string) {
    const date = new Date(tanggal);
    if (isNaN(date.getTime()))
      throw new BadRequestException("tanggal tidak valid");

    const where: any = {
      tanggal: date,
      pegawai: {
        role: { notIn: [ROLES.ADMIN, ROLES.PIMPINAN] },
        NOT: { username: { startsWith: "demo" } },
      },
    };
    if (teamId)
      where.penugasan = {
        kegiatan: { teamId },
      };

    const whereUser: any = {
      role: { notIn: [ROLES.ADMIN, ROLES.PIMPINAN] },
      NOT: { username: { startsWith: "demo" } },
    };
    if (teamId) whereUser.members = { some: { teamId } };

    const [records, users] = await Promise.all([
      this.prisma.laporanHarian.findMany({
        where,
        include: { pegawai: true },
      }),
      this.prisma.user.findMany({
        where: whereUser,
        select: { id: true, nama: true },
        orderBy: { nama: "asc" },
      }),
    ]);

    if (records.length === 0) {
      return users.map((u: { id: string; nama: string }) => ({
        userId: u.id,
        nama: u.nama,
        selesai: 0,
        total: 0,
        persen: 0,
      }));
    }

    const byUser: Record<
      string,
      { nama: string; selesai: number; total: number }
    > = {};

    for (const u of users) {
      byUser[u.id] = { nama: u.nama, selesai: 0, total: 0 };
    }

    for (const r of records) {
      const u = byUser[r.pegawaiId];
      if (!u) continue;
      u.total += 1;
      if (r.status === STATUS.SELESAI_DIKERJAKAN) u.selesai += 1;
    }

    return Object.entries(byUser)
      .map(([id, v]) => ({
        userId: id,
        nama: v.nama,
        selesai: v.selesai,
        total: v.total,
        persen: v.total ? Math.round((v.selesai / v.total) * 100) : 0,
      }))
      .sort((a, b) => a.nama.localeCompare(b.nama));
  }

  async mingguanAll(minggu: string, teamId?: string) {
    const targetDate = new Date(minggu);
    if (isNaN(targetDate.getTime()))
      throw new BadRequestException("minggu tidak valid");

    const start = new Date(targetDate);
    const offset = (start.getUTCDay() + 6) % 7;
    start.setUTCDate(start.getUTCDate() - offset);

    const end = new Date(start);
    end.setUTCDate(start.getUTCDate() + 6);

    const where: any = {
      tanggal: { gte: start, lte: end },
      pegawai: {
        role: { notIn: [ROLES.ADMIN, ROLES.PIMPINAN] },
        NOT: { username: { startsWith: "demo" } },
      },
    };
    if (teamId)
      where.penugasan = {
        kegiatan: { teamId },
      };

    const records = (
      await this.prisma.laporanHarian.findMany({
        where,
        include: { pegawai: true },
      })
    ).filter((r: { pegawai?: { username?: string } }) =>
      !r.pegawai?.username?.startsWith("demo"),
    );
    if (records.length === 0) {
      const users =
        (await this.prisma.user.findMany({
          where: teamId ? { members: { some: { teamId } } } : {},
          orderBy: { nama: "asc" },
        })) || [];
      return users
        .filter((u: { username?: string }) =>
          !u.username?.startsWith("demo"),
        )
        .map((u: { id: string; nama: string }) => ({
          userId: u.id,
          nama: u.nama,
          selesai: 0,
          total: 0,
          persen: 0,
        }));
    }

    const whereUser: any = {
      role: { notIn: [ROLES.ADMIN, ROLES.PIMPINAN] },
      NOT: { username: { startsWith: "demo" } },
    };
    if (teamId) whereUser.members = { some: { teamId } };

    const users = await this.prisma.user.findMany({
      where: whereUser,
      select: { id: true, nama: true },
      orderBy: { nama: "asc" },
    });

    const byUser: Record<string, { nama: string; selesai: number; total: number }> =
      {};
    for (const u of users) {
      byUser[u.id] = { nama: u.nama, selesai: 0, total: 0 };
    }

    for (const r of records) {
      const u = byUser[r.pegawaiId];
      if (!u) continue;
      u.total += 1;
      if (r.status === STATUS.SELESAI_DIKERJAKAN) u.selesai += 1;
    }

    return Object.entries(byUser)
      .map(([id, v]) => ({
        userId: id,
        nama: v.nama,
        selesai: v.selesai,
        total: v.total,
        persen: v.total ? Math.round((v.selesai / v.total) * 100) : 0,
      }))
      .sort((a, b) => a.nama.localeCompare(b.nama));
  }

  async mingguanBulan(tanggal: string, teamId?: string) {
    const base = new Date(tanggal);
    if (isNaN(base.getTime()))
      throw new BadRequestException("tanggal tidak valid");

    const year = base.getFullYear();
    const month = base.getMonth();

    const monthStart = new Date(Date.UTC(year, month, 1));
    const monthEnd = new Date(Date.UTC(year, month + 1, 0));

    const firstMonday = new Date(monthStart);
    firstMonday.setUTCDate(
      monthStart.getUTCDate() - ((monthStart.getUTCDay() + 6) % 7),
    );
    const weekStarts: Date[] = [];
    for (let d = new Date(firstMonday); d <= monthEnd; d.setUTCDate(d.getUTCDate() + 7)) {
      weekStarts.push(new Date(d));
    }

    const where: any = {
      tanggal: { gte: monthStart, lte: monthEnd },
      pegawai: {
        role: { notIn: [ROLES.ADMIN, ROLES.PIMPINAN] },
        NOT: { username: { startsWith: "demo" } },
      },
    };
    if (teamId)
      where.penugasan = {
        kegiatan: { teamId },
      };

    const records = await this.prisma.laporanHarian.findMany({
      where,
      include: { pegawai: true },
    });

    const whereUser: any = {
      role: { notIn: [ROLES.ADMIN, ROLES.PIMPINAN] },
      NOT: { username: { startsWith: "demo" } },
    };
    if (teamId) whereUser.members = { some: { teamId } };

    const users = await this.prisma.user.findMany({
      where: whereUser,
      select: { id: true, nama: true },
      orderBy: { nama: "asc" },
    });

    if (records.length === 0) {
      const emptyWeeks = weekStarts.map(() => ({
        selesai: 0,
        total: 0,
        persen: 0,
      }));
      return users.map((u: { id: string; nama: string }) => ({
        userId: u.id,
        nama: u.nama,
        weeks: emptyWeeks,
      }));
    }

    const byUser: Record<
      string,
      { nama: string; perWeek: Record<number, { selesai: number; total: number }> }
    > = {};
    for (const u of users) {
      byUser[u.id] = { nama: u.nama, perWeek: {} };
    }

    for (const r of records) {
      const u = byUser[r.pegawaiId];
      if (!u) continue;
      const idx = Math.floor(
        (r.tanggal.getTime() - weekStarts[0].getTime()) / (7 * 24 * 60 * 60 * 1000),
      );
      if (!u.perWeek[idx]) u.perWeek[idx] = { selesai: 0, total: 0 };
      u.perWeek[idx].total += 1;
      if (r.status === STATUS.SELESAI_DIKERJAKAN)
        u.perWeek[idx].selesai += 1;
    }

    return Object.entries(byUser)
      .map(([id, v]) => {
        const weeks = weekStarts.map((_, i) => {
          const w = v.perWeek[i] || { selesai: 0, total: 0 };
          const persen = w.total > 0 ? 100 : 0;
          return { selesai: w.selesai, total: w.total, persen };
        });
        return { userId: id, nama: v.nama, weeks };
      })
      .sort((a, b) => a.nama.localeCompare(b.nama));
  }

  async penugasanMinggu(
    minggu: string,
    teamId?: string,
    userId?: string,
  ) {
    const targetDate = new Date(minggu);
    if (isNaN(targetDate.getTime()))
      throw new BadRequestException("minggu tidak valid");

    const mingguKe = getWeekOfMonth(targetDate);
    const bulan = String(targetDate.getMonth() + 1);
    const tahun = targetDate.getFullYear();

    // Align to Monday for consistency even though it's not used afterward
    const start = new Date(targetDate);
    const offset = (start.getDay() + 6) % 7;
    start.setDate(start.getDate() - offset);

    const where: any = {
      minggu: mingguKe,
      bulan,
      tahun,
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
    teamId?: string,
    userId?: string,
  ) {
    const base = new Date(tanggal);
    if (isNaN(base.getTime()))
      throw new BadRequestException("tanggal tidak valid");

    const year = base.getFullYear();
    const month = base.getMonth();

    const monthStart = new Date(Date.UTC(year, month, 1));
    const monthEnd = new Date(Date.UTC(year, month + 1, 0));

    const firstMonday = new Date(monthStart);
    firstMonday.setUTCDate(
      monthStart.getUTCDate() - ((monthStart.getUTCDay() + 6) % 7),
    );
    const weekStarts: Date[] = [];
    for (let d = new Date(firstMonday); d <= monthEnd; d.setUTCDate(d.getUTCDate() + 7)) {
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

  async bulananAll(year: string, teamId?: string, bulan?: string) {
    const yr = parseInt(year, 10);
    if (isNaN(yr)) throw new BadRequestException("year tidak valid");

    const where: any = {
      tahun: yr,
      pegawai: {
        role: { notIn: [ROLES.ADMIN, ROLES.PIMPINAN] },
        NOT: { username: { startsWith: "demo" } },
      },
    };
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
      string,
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
        userId: id,
        nama: v.nama,
        selesai: v.selesai,
        total: v.total,
        persen: v.total ? Math.round((v.selesai / v.total) * 100) : 0,
      }))
      .sort((a, b) => a.nama.localeCompare(b.nama));
  }

  async bulananMatrix(year: string, teamId?: string) {
    const yr = parseInt(year, 10);
    if (isNaN(yr)) throw new BadRequestException("year tidak valid");

    const where: any = {
      tahun: yr,
      pegawai: {
        role: { notIn: [ROLES.ADMIN, ROLES.PIMPINAN] },
        NOT: { username: { startsWith: "demo" } },
      },
    };
    if (teamId) where.kegiatan = { teamId };

    const tugas = await this.prisma.penugasan.findMany({
      where,
      include: { pegawai: true },
    });

    const byUser: Record<
      string,
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
        return { userId: id, nama: v.nama, months };
      })
      .sort((a, b) => a.nama.localeCompare(b.nama));
  }

  async laporanTerlambat(teamId?: string) {
    const whereUser: any = {
      NOT: { role: { in: [ROLES.ADMIN, ROLES.PIMPINAN] } },
    };
    if (teamId) whereUser.members = { some: { teamId } };

    const users = await this.prisma.user.findMany({
      where: whereUser,
      include: { laporan: { orderBy: { tanggal: 'desc' }, take: 1 } },
      orderBy: { nama: 'asc' },
    });

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const result = { day1: [], day3: [], day7: [] } as Record<
      'day1' | 'day3' | 'day7',
      { userId: string; nama: string; lastDate: string | null }[]
    >;

    for (const u of users) {
      const last = u.laporan[0]?.tanggal;
      let diff = Infinity;
      let lastDate: string | null = null;
      if (last) {
        const d = new Date(last);
        d.setHours(0, 0, 0, 0);
        diff = Math.floor((today.getTime() - d.getTime()) / 86400000);
        lastDate = d.toISOString();
      }

      const entry = { userId: u.id, nama: u.nama, lastDate };

      if (diff >= 7) result.day7.push(entry);
      else if (diff >= 3) result.day3.push(entry);
      else if (diff >= 1) result.day1.push(entry);
    }

    return result;
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
