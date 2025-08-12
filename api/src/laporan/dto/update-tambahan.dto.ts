import { IsDateString, IsOptional, IsString } from "class-validator";
import { Transform } from "class-transformer";

export class UpdateTambahanDto {
  @IsString()
  kegiatanId: string;

  @Transform(({ value }) => (value === "" ? undefined : value))
  @IsDateString()
  tanggal: string;

  @Transform(({ value }) => (value === "" ? undefined : value))
  @IsString()
  status: string;

  @IsOptional()
  @Transform(({ value }) => (value === "" ? undefined : value))
  @IsString()
  buktiLink?: string;

  @Transform(({ value }) => (value === "" ? undefined : value))
  @IsString()
  deskripsi: string;

  @Transform(({ value }) => (value === "" ? undefined : value))
  @IsString()
  capaianKegiatan: string;

  @IsOptional()
  @Transform(({ value }) => (value === "" ? undefined : value))
  @IsDateString()
  tanggalSelesai?: string;

  @IsOptional()
  @Transform(({ value }) => (value === "" ? undefined : value))
  @IsDateString()
  tanggalSelesaiAkhir?: string;
}
