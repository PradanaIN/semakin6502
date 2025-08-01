import { Transform } from "class-transformer";
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
  @Transform(({ value }) => (value === null || value === "" ? undefined : value))
  @IsString()
  buktiLink?: string;

  @IsOptional()
  @Transform(({ value }) => (value === null || value === "" ? undefined : value))
  @IsString()
  catatan?: string;

  @IsOptional()
  @IsString()
  pegawaiId?: string;
}
