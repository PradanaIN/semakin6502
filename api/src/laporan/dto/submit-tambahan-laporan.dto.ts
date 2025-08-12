import { IsDateString, IsOptional, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class SubmitTambahanLaporanDto {
  @ApiProperty()
  @IsDateString()
  tanggal!: string;

  @ApiProperty()
  @IsString()
  status!: string;

  @ApiProperty()
  @IsString()
  deskripsi!: string;

  @ApiProperty()
  @IsString()
  capaianKegiatan!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  buktiLink?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  catatan?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  pegawaiId?: string;
}
