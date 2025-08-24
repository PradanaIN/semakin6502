import { IsDateString, IsOptional, IsString } from "class-validator";
import { Transform } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";
import { Status } from "../../common/status.constants";

export class AddTambahanDto {
  @ApiProperty()
  @IsString()
  kegiatanId!: string;

  @ApiProperty()
  @IsDateString()
  tanggal!: string;

  @ApiProperty()
  @IsString()
  status!: Status;

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

  @ApiProperty()
  @IsString()
  capaianKegiatan!: string;

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
