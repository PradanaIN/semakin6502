import { IsDateString, IsInt, IsOptional, IsString } from "class-validator";

export class UpdateLaporanDto {
  @IsDateString()
  tanggal!: string;

  @IsString()
  status!: string;

  @IsString()
  deskripsi!: string;

  @IsOptional()
  @IsString()
  capaianKegiatan?: string;

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
