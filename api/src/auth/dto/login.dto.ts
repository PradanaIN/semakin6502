import { IsString, MinLength, IsOptional, IsBoolean } from "class-validator";

export class LoginDto {
  @IsString()
  identifier!: string;
  @IsString()
  @MinLength(6)
  password!: string;
  @IsBoolean()
  @IsOptional()
  remember?: boolean;
}
