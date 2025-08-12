import { IsDateString, IsOptional, IsString } from "class-validator";
import { Transform } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateTambahanDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  kegiatanId?: string;

  @ApiProperty({ required: false })
  @Transform(({ value }) => (value === "" ? undefined : value))
  @IsOptional()
  @IsDateString()
  tanggal?: string;

  @ApiProperty({ required: false })
  @Transform(({ value }) => (value === "" ? undefined : value))
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => (value === "" ? undefined : value))
  @IsString()
  buktiLink?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => (value === "" ? undefined : value))
  @IsString()
  deskripsi?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => (value === "" ? undefined : value))
  @IsString()
  capaianKegiatan?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => (value === "" ? undefined : value))
  @IsDateString()
  tanggalSelesai?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => (value === "" ? undefined : value))
  @IsDateString()
  tanggalSelesaiAkhir?: string;
}
