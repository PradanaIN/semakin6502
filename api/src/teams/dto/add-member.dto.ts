import { IsBoolean, IsNotEmpty, IsString } from "class-validator";

export class AddMemberDto {
  @IsString()
  @IsNotEmpty()
  user_id!: string;

  @IsBoolean()
  isLeader!: boolean;
}
