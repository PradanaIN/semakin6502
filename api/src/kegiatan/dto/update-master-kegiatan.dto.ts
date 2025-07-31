import { IsString, IsOptional } from 'class-validator';

export class UpdateMasterKegiatanDto {
  @IsString()
  teamId!: string;

  @IsString()
  namaKegiatan!: string;

  @IsOptional()
  @IsString()
  deskripsi?: string;
}
