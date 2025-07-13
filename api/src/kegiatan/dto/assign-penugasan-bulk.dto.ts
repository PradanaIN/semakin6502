import { IsInt, IsString, IsArray, ArrayNotEmpty } from "class-validator";

export class AssignPenugasanBulkDto {
  @IsInt()
  kegiatanId!: number;

  @IsArray()
  @ArrayNotEmpty()
  pegawaiIds!: number[];

  @IsInt()
  minggu!: number;

  @IsString()
  bulan!: string;

  @IsInt()
  tahun!: number;

  @IsString()
  deskripsi?: string;