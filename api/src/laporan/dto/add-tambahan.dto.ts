import { IsDateString, IsInt, IsOptional, IsString } from "class-validator";

export class AddTambahanDto {
  @IsInt()
  kegiatanId!: number;

  @IsDateString()
  tanggal!: string;

  @IsString()
  status!: string;

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
