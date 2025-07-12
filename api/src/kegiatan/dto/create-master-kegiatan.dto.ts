import { IsInt, IsString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMasterKegiatanDto {
  @Type(() => Number)
  @IsInt()
  teamId!: number;

  @IsString()
  nama_kegiatan!: string;

  @IsOptional()
  @IsString()
  deskripsi?: string;
}
