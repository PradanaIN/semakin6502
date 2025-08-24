import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Inject,
} from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import type { Cache } from "cache-manager";
import { ulid } from "ulid";
import { ROLES } from "../common/roles.constants";
import { STATUS } from "../common/status.constants";
import { PrismaService } from "../prisma.service";
import { AddTambahanDto } from "./dto/add-tambahan.dto";
import { UpdateTambahanDto } from "./dto/update-tambahan.dto";
import { SubmitTambahanLaporanDto } from "./dto/submit-tambahan-laporan.dto";
import { normalizeRole } from "../common/roles";

@Injectable()
export class TambahanService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER)
    private cache?: Cache & {
      reset?: () => Promise<void>;
      store?: {
        reset?: () => Promise<void>;
        clear?: () => Promise<void>;
        keys?: () => Promise<string[]>;
      };
    },
  ) {}

  private async invalidateCache(keys?: string | string[]) {
    if (!this.cache) return;
    const cache: any = this.cache;
    if (keys) {
      const arr = Array.isArray(keys) ? keys : [keys];
      await Promise.all(arr.map((key) => cache.del(key)));
      return;
    }
    if (typeof cache.reset === "function") {
      await cache.reset();
    } else if (typeof cache.store?.reset === "function") {
      await cache.store.reset();
    } else if (typeof cache.store?.keys === "function") {
      const allKeys = await cache.store.keys();
      if (allKeys?.length) {
        await Promise.all(allKeys.map((k: string) => cache.del(k)));
      }
    } else if (typeof cache.store?.clear === "function") {
      await cache.store.clear();
    }
  }

  private async syncStatus(tambahanId: string) {
    try {
      const tambahan = await this.prisma.kegiatanTambahan.findUnique({
        where: { id: tambahanId },
      });
      if (!tambahan) return;

      const finished = await this.prisma.laporanHarian.findFirst({
        where: { tambahanId, status: STATUS.SELESAI_DIKERJAKAN },
      });
      if (finished) {
        if (tambahan.status !== STATUS.SELESAI_DIKERJAKAN) {
          await this.prisma.kegiatanTambahan.update({
            where: { id: tambahanId },
            data: { status: STATUS.SELESAI_DIKERJAKAN },
          });
        }
        return;
      }

      const latest = await this.prisma.laporanHarian.findFirst({
        where: { tambahanId },
        orderBy: { tanggal: "desc" },
      });
      await this.prisma.kegiatanTambahan.update({
        where: { id: tambahanId },
        data: { status: latest?.status || STATUS.BELUM },
      });
    } catch (err) {
      console.error("Failed to sync tambahan status", err);
    }
  }
  async add(data: AddTambahanDto & { userId: string }) {
    if (
      [STATUS.SEDANG_DIKERJAKAN, STATUS.SELESAI_DIKERJAKAN].includes(
        data.status
      ) &&
      !data.buktiLink
    ) {
      throw new BadRequestException(
        "buktiLink diperlukan ketika status sedang atau selesai"
      );
    }
    const master = await this.prisma.masterKegiatan.findUnique({
      where: { id: data.kegiatanId },
    });
    
    if (!master) throw new NotFoundException('master kegiatan tidak ditemukan');
    return this.prisma.kegiatanTambahan.create({
      data: {
        id: ulid(),
        nama: master.namaKegiatan,
        tanggal: new Date(data.tanggal),
        status: data.status,
        capaianKegiatan: data.capaianKegiatan,
        buktiLink: data.buktiLink,
        deskripsi: data.deskripsi,
        tanggalSelesai: data.tanggalSelesai ? new Date(data.tanggalSelesai) : undefined,
        tanggalSelesaiAkhir: data.tanggalSelesaiAkhir ? new Date(data.tanggalSelesaiAkhir) : undefined,
        userId: data.userId,
        kegiatanId: master.id,
        teamId: master.teamId,
      },
      include: { kegiatan: { include: { team: true } } },
    });
  }

  getByUser(userId: string) {
    return this.prisma.kegiatanTambahan.findMany({
      where: { userId },
      include: { kegiatan: { include: { team: true } } },
    });
  }

  getAll(filter: { teamId?: string; userId?: string } = {}) {
    const where: any = {};
    if (filter.teamId) where.teamId = filter.teamId;
    if (filter.userId) where.userId = filter.userId;
    return this.prisma.kegiatanTambahan.findMany({
      where,
      include: { kegiatan: { include: { team: true } }, user: true },
      orderBy: { tanggal: "desc" },
    });
  }

  getOne(id: string, userId: string, role: string) {
    const where: any = { id };
    if (role !== ROLES.ADMIN && role !== ROLES.PIMPINAN) {
      where.userId = userId;
    }
    return this.prisma.kegiatanTambahan.findFirst({
      where,
      include: { kegiatan: { include: { team: true } } },
    });
  }

  async update(id: string, data: UpdateTambahanDto, userId: string) {
    const updateData: any = {};

    if (data.kegiatanId !== undefined) {
      const master = await this.prisma.masterKegiatan.findUnique({
        where: { id: data.kegiatanId },
      });
      if (!master) throw new NotFoundException('master kegiatan tidak ditemukan');
      updateData.kegiatanId = master.id;
      updateData.nama = master.namaKegiatan;
      updateData.teamId = master.teamId;
    }

    if (data.tanggal !== undefined) {
      updateData.tanggal = new Date(data.tanggal);
    }
    if (data.status !== undefined) {
      updateData.status = data.status;
    }
    if (data.buktiLink !== undefined) {
      updateData.buktiLink = data.buktiLink;
    }
    if (data.deskripsi !== undefined) {
      updateData.deskripsi = data.deskripsi;
    }
    if (data.capaianKegiatan !== undefined) {
      updateData.capaianKegiatan = data.capaianKegiatan;
    }
    if (data.tanggalSelesai !== undefined) {
      updateData.tanggalSelesai = new Date(data.tanggalSelesai);
    }
    if (data.tanggalSelesaiAkhir !== undefined) {
      updateData.tanggalSelesaiAkhir = new Date(data.tanggalSelesaiAkhir);
    }
    const existing = await this.prisma.kegiatanTambahan.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      const any = await this.prisma.kegiatanTambahan.findUnique({
        where: { id },
      });
      if (!any) throw new NotFoundException("tugas tambahan tidak ditemukan");
      throw new ForbiddenException("bukan tugas tambahan anda");
    }
    const finalStatus = data.status ?? existing.status;
    const finalBukti = data.buktiLink ?? existing.buktiLink;
    if (
      [STATUS.SEDANG_DIKERJAKAN, STATUS.SELESAI_DIKERJAKAN].includes(
        finalStatus
      ) &&
      !finalBukti
    ) {
      throw new BadRequestException(
        "buktiLink diperlukan ketika status sedang atau selesai"
      );
    }
    return this.prisma.kegiatanTambahan.update({
      where: { id },
      data: updateData,
      include: { kegiatan: { include: { team: true } } },
    });
  }

  async remove(id: string, userId: string) {
    const existing = await this.prisma.kegiatanTambahan.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      const any = await this.prisma.kegiatanTambahan.findUnique({
        where: { id },
      });
      if (!any) throw new NotFoundException("tugas tambahan tidak ditemukan");
      throw new ForbiddenException("bukan tugas tambahan anda");
    }
    const count = await this.prisma.laporanHarian.count({
      where: { tambahanId: id },
    });
    if (count > 0) {
      throw new BadRequestException(
        "Hapus laporan harian tugas tambahan ini terlebih dahulu",
      );
    }
    return this.prisma.kegiatanTambahan.delete({ where: { id } });
  }

  async addLaporan(
    id: string,
    data: SubmitTambahanLaporanDto,
    userId: string,
    role: string
  ) {
    role = normalizeRole(role);
    if (role === ROLES.PIMPINAN) {
      throw new ForbiddenException("pimpinan tidak diizinkan");
    }
    if (
      [STATUS.SEDANG_DIKERJAKAN, STATUS.SELESAI_DIKERJAKAN].includes(
        data.status
      ) &&
      !data.buktiLink
    ) {
      throw new BadRequestException(
        "buktiLink diperlukan ketika status sedang atau selesai"
      );
    }

    const tambahan = await this.prisma.kegiatanTambahan.findUnique({
      where: { id },
    });
    if (!tambahan) throw new NotFoundException("tugas tambahan tidak ditemukan");

    let targetId = data.pegawaiId ?? userId;
    if (tambahan.userId !== targetId) {
      if (role === ROLES.ADMIN) {
        targetId = tambahan.userId;
      } else if (role === ROLES.KETUA) {
        const leader = await this.prisma.member.findFirst({
          where: { teamId: tambahan.teamId, userId, isLeader: true },
        });
        if (!leader) throw new ForbiddenException("bukan tugas tambahan anda");
        targetId = tambahan.userId;
      } else {
        throw new ForbiddenException("bukan tugas tambahan anda");
      }
    }

    const laporan = await this.prisma.laporanHarian.create({
      data: {
        id: ulid(),
        tambahanId: id,
        pegawaiId: targetId,
        tanggal: new Date(data.tanggal),
        status: data.status,
        capaianKegiatan: data.capaianKegiatan,
        deskripsi: data.deskripsi,
        buktiLink: data.buktiLink || undefined,
        catatan: data.catatan || undefined,
      },
    });

    await this.syncStatus(id);
    await this.invalidateCache();
    return laporan;
  }
}
