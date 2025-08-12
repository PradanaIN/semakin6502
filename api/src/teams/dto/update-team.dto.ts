import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UpdateTeamDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  namaTim?: string;
}
