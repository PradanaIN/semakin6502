import { IsDateString, IsInt, IsOptional, IsString } from "class-validator";

export class UpdateTambahanDto {
  @IsOptional()
  @IsString()
  nama?: string;

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

  @IsOptional()
  @IsInt()
  userId?: number;
}
