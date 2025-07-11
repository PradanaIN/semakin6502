import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from "@nestjs/common";
import { TeamsService } from "./teams.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/guards/roles.decorator";

@Controller("teams")
@UseGuards(JwtAuthGuard, RolesGuard)
export class TeamsController {
  constructor(private teamsService: TeamsService) {}

  @Get()
  @Roles("admin")
  findAll() {
    return this.teamsService.findAll();
  }

  @Get(":id")
  @Roles("admin")
  findOne(@Param("id") id: number) {
    return this.teamsService.findOne(id);
  }

  @Post()
  @Roles("admin")
  create(@Body() body: any) {
    return this.teamsService.create(body);
  }

  @Put(":id")
  @Roles("admin")
  update(@Param("id") id: number, @Body() body: any) {
    return this.teamsService.update(id, body);
  }

  @Delete(":id")
  @Roles("admin")
  remove(@Param("id") id: number) {
    return this.teamsService.remove(id);
  }

  @Post(":id/members")
  @Roles("admin")
  addMember(@Param("id") teamId: number, @Body() member: any) {
    return this.teamsService.addMember(teamId, member);
  }
}
