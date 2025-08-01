import { IsDateString, IsOptional, IsString } from "class-validator";

export class SubmitLaporanDto {
  @IsString()
  penugasanId!: string;

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
  @IsString()
  pegawaiId?: string;
}
