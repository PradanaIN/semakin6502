import { IsInt, IsString, IsOptional } from "class-validator";

export class AssignPenugasanDto {
  @IsInt()
  kegiatanId!: number;

  @IsInt()
  pegawaiId!: number;

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
