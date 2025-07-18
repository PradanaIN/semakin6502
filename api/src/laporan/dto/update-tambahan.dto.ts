import { IsDateString, IsInt, IsOptional, IsString } from "class-validator";
import { Transform } from "class-transformer";

export class UpdateTambahanDto {
  @IsOptional()
  @IsInt()
  kegiatanId?: number;

  @IsOptional()
  @Transform(({ value }) => (value === "" ? undefined : value))
  @IsDateString()
  tanggal?: string;

  @IsOptional()
  @Transform(({ value }) => (value === "" ? undefined : value))
  @IsString()
  status?: string;

  @IsOptional()
  @Transform(({ value }) => (value === "" ? undefined : value))
  @IsString()
  buktiLink?: string;

  @IsOptional()
  @Transform(({ value }) => (value === "" ? undefined : value))
  @IsString()
  deskripsi?: string;

  @IsOptional()
  @Transform(({ value }) => (value === "" ? undefined : value))
  @IsDateString()
  tanggalSelesai?: string;

  @IsOptional()
  @Transform(({ value }) => (value === "" ? undefined : value))
  @IsDateString()
  tanggalSelesaiAkhir?: string;
}
