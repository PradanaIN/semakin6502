import { IsDateString, IsInt, IsOptional, IsString } from "class-validator";

export class SubmitLaporanDto {
  @IsInt()
  penugasanId!: number;

  @IsDateString()
  tanggal!: string;

  @IsString()
  status!: string;

  @IsString()
  deskripsi!: string;

  @IsString()
  capaianKegiatan!: string;

  @IsOptional()
  @IsString()
  buktiLink?: string;

  @IsOptional()
  @IsString()
  catatan?: string;

  @IsOptional()
  @IsInt()
  pegawaiId?: number;
}
