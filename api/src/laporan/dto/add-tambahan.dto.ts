import { IsDateString, IsInt, IsOptional, IsString } from "class-validator";
import { Transform } from "class-transformer";

export class AddTambahanDto {
  @IsString()
  kegiatanId!: string;

  @IsDateString()
  tanggal!: string;

  @IsString()
  status!: string;

  @IsOptional()
  @Transform(({ value }) => (value === "" ? undefined : value))
  @IsString()
  buktiLink?: string;

  @IsOptional()
  @Transform(({ value }) => (value === "" ? undefined : value))
  @IsString()
  deskripsi?: string;

  @IsString()
  capaianKegiatan!: string;

  @IsOptional()
  @Transform(({ value }) => (value === "" ? undefined : value))
  @IsDateString()
  tanggalSelesai?: string;

  @IsOptional()
  @Transform(({ value }) => (value === "" ? undefined : value))
  @IsDateString()
  tanggalSelesaiAkhir?: string;
}
