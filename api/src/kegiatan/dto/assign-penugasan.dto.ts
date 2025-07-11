import { IsInt, IsString } from "class-validator";

export class AssignPenugasanDto {
  @IsInt()
  kegiatanId!: number;

  @IsInt()
  pegawaiId!: number;

  @IsInt()
  minggu!: number;

  @IsString()
  bulan!: string;

  @IsInt()
  tahun!: number;
}
