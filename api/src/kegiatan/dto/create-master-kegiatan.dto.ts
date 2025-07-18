import { IsInt, IsString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMasterKegiatanDto {
  @Type(() => Number)
  @IsInt()
  teamId!: number;

  @IsString()
  namaKegiatan!: string;

  @IsOptional()
  @IsString()
  deskripsi?: string;
}
