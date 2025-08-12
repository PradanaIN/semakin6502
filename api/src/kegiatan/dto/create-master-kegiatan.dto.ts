import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMasterKegiatanDto {
  @ApiProperty()
  @IsString()
  teamId!: string;

  @ApiProperty()
  @IsString()
  namaKegiatan!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  deskripsi?: string;
}
