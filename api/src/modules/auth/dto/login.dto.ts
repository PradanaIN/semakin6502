import { IsString, MinLength, IsOptional, IsBoolean } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class LoginDto {
  @ApiProperty()
  @IsString()
  identifier!: string;
  @ApiProperty()
  @IsString()
  @MinLength(6)
  password!: string;
  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  remember?: boolean;
}
