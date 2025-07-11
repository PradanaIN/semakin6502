import { IsDateString, IsInt, IsOptional, IsString } from "class-validator";

export class AddTambahanDto {
  @IsString()
  nama!: string;

  @IsDateString()
  tanggal!: string;

  @IsString()
  status!: string;

  @IsOptional()
  @IsString()
  bukti_link?: string;

  @IsInt()
  userId!: number;
}
