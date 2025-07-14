import { IsDateString, IsInt, IsOptional, IsString } from "class-validator";

export class UpdateTambahanDto {
  @IsOptional()
  @IsInt()
  kegiatanId?: number;

  @IsOptional()
  @IsDateString()
  tanggal?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  bukti_link?: string;

  @IsOptional()
  @IsString()
  deskripsi?: string;

  @IsOptional()
  @IsDateString()
  tanggal_selesai?: string;

  @IsOptional()
  @IsDateString()
  tanggal_selesai_akhir?: string;
}
