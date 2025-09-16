import { Transform } from "class-transformer";
import { IsDateString, IsOptional, IsString, ValidateIf } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { STATUS } from "@shared/constants/status.constants";

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
  @Transform(({ value }) => (value === null || value === "" ? undefined : value))
  @ValidateIf(
    (o) =>
      [STATUS.SEDANG_DIKERJAKAN, STATUS.SELESAI_DIKERJAKAN].includes(o.status)
  )
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
