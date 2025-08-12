import { IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateTeamDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  namaTim!: string;
}
