import { IsDateString, IsOptional, IsString, ValidateIf } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import STATUS, { Status } from "@shared/constants/status.constants";

export class SubmitTambahanLaporanDto {
  @ApiProperty()
  @IsDateString()
  tanggal!: string;

  @ApiProperty()
  @IsString()
  status!: Status;

  @ApiProperty()
  @IsString()
  deskripsi!: string;

  @ApiProperty()
  @IsString()
  capaianKegiatan!: string;

  @ApiProperty({ required: false })
  @ValidateIf(
    (o) =>
      (
        [STATUS.SEDANG_DIKERJAKAN, STATUS.SELESAI_DIKERJAKAN] as Status[]
      ).includes(o.status)
  )
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
