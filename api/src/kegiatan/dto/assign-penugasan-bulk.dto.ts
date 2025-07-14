import { IsInt, IsString, IsArray, ArrayNotEmpty, IsOptional } from "class-validator";

export class AssignPenugasanBulkDto {
  @IsInt()
  kegiatanId!: number;

  @IsArray()
  @ArrayNotEmpty()
  pegawaiIds!: number[];

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
