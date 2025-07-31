import { IsString, IsOptional } from 'class-validator';

export class CreateMasterKegiatanDto {
  @IsString()
  teamId!: string;

  @IsString()
  namaKegiatan!: string;

  @IsOptional()
  @IsString()
  deskripsi?: string;
}
