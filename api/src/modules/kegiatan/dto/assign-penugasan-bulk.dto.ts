import { IsInt, IsString, IsArray, ArrayNotEmpty, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class AssignPenugasanBulkDto {
  @ApiProperty()
  @IsString()
  kegiatanId!: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayNotEmpty()
  pegawaiIds!: string[];

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
