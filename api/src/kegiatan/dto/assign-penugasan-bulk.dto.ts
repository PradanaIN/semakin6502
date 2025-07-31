import { IsInt, IsString, IsArray, ArrayNotEmpty, IsOptional } from "class-validator";

export class AssignPenugasanBulkDto {
  @IsString()
  kegiatanId!: string;

  @IsArray()
  @ArrayNotEmpty()
  pegawaiIds!: string[];

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
