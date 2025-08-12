import { Transform } from "class-transformer";
import { IsDateString, IsOptional, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateLaporanDto {
  @ApiProperty()
  @IsDateString()
  tanggal!: string;

  @ApiProperty()
  @IsString()
  status!: string;

  @ApiProperty()
  @IsString()
  deskripsi!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  capaianKegiatan?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => (value === null || value === "" ? undefined : value))
  @IsString()
  buktiLink?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => (value === null || value === "" ? undefined : value))
  @IsString()
  catatan?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  pegawaiId?: string;
}
