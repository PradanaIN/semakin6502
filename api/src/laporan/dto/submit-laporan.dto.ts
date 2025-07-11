import { IsDateString, IsInt, IsOptional, IsString } from "class-validator";

export class SubmitLaporanDto {
  @IsInt()
  penugasanId!: number;

  @IsDateString()
  tanggal!: string;

  @IsString()
  status!: string;

  @IsOptional()
  @IsString()
  bukti_link?: string;

  @IsOptional()
  @IsString()
  catatan?: string;

  @IsInt()
  pegawaiId!: number;
}
