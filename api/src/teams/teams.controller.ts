import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { TeamsService } from "./teams.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/guards/roles.decorator";
import { Request } from "express";
import { ROLES } from "../common/roles.constants";
import { AuthRequestUser } from "../common/auth-request-user.interface";
import { CreateTeamDto } from "./dto/create-team.dto";
import { UpdateTeamDto } from "./dto/update-team.dto";
import { AddMemberDto } from "./dto/add-member.dto";

@ApiTags("teams")
@Controller("teams")
@UseGuards(JwtAuthGuard, RolesGuard)
export class TeamsController {
  constructor(private teamsService: TeamsService) {}

  @Get()
  findAll(@Req() req: Request) {
    const user = req.user as AuthRequestUser;
    if (user.role === ROLES.ADMIN) {
      return this.teamsService.findAll();
    }
    return this.teamsService.findByLeader(user.userId);
  }

  @Get("all")
  findAllPublic() {
    return this.teamsService.findAllPublic();
  }

  @Get("member")
  findMemberTeams(@Req() req: Request) {
    const user = req.user as AuthRequestUser;
    return this.teamsService.findByMember(user.userId);
  }

  @Get(":id")
  @Roles(ROLES.ADMIN)
  findOne(@Param("id") id: string) {
    return this.teamsService.findOne(id);
  }

  @Post()
  @Roles(ROLES.ADMIN)
  create(@Body() body: CreateTeamDto) {
    return this.teamsService.create(body);
  }

  @Put(":id")
  @Roles(ROLES.ADMIN)
  update(@Param("id") id: string, @Body() body: UpdateTeamDto) {
    return this.teamsService.update(id, body);
  }

  @Delete(":id")
  @Roles(ROLES.ADMIN)
  remove(@Param("id") id: string) {
    return this.teamsService.remove(id);
  }

  @Post(":id/members")
  @Roles(ROLES.ADMIN)
  addMember(@Param("id") teamId: string, @Body() member: AddMemberDto) {
    return this.teamsService.addMember(teamId, member);
  }
}
