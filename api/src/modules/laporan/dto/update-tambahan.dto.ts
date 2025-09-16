import { IsDateString, IsOptional, IsString, ValidateIf } from "class-validator";
import { Transform } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import STATUS, { Status } from "@shared/constants/status.constants";

export class UpdateTambahanDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  kegiatanId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => (value === "" ? undefined : value))
  @IsDateString()
  tanggal?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  status?: Status;

  @ApiProperty({ required: false })
  @Transform(({ value }) => (value === "" ? undefined : value))
  @ValidateIf(
    (o) =>
    (
      [STATUS.SEDANG_DIKERJAKAN, STATUS.SELESAI_DIKERJAKAN] as Status[]
    ).includes(o.status as Status)
  )
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
