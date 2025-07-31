import { IsInt, IsString, IsOptional } from "class-validator";

export class AssignPenugasanDto {
  @IsString()
  kegiatanId!: string;

  @IsString()
  pegawaiId!: string;

  @IsInt()
  minggu!: number;

  @IsInt()
  bulan!: number;

  @IsInt()
  tahun!: number;

  @IsString()
  deskripsi?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
