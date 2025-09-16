import { IsInt, IsString, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class AssignPenugasanDto {
  @ApiProperty()
  @IsString()
  kegiatanId!: string;

  @ApiProperty()
  @IsString()
  pegawaiId!: string;

  @ApiProperty()
  @IsInt()
  minggu!: number;

  @ApiProperty()
  @IsInt()
  bulan!: number;

  @ApiProperty()
  @IsInt()
  tahun!: number;

  @ApiProperty({ required: false })
  @IsString()
  deskripsi?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  status?: string;
}
