import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
  Req,
} from "@nestjs/common";
import { TeamsService } from "./teams.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/guards/roles.decorator";
import { Request } from "express";

@Controller("teams")
@UseGuards(JwtAuthGuard, RolesGuard)
export class TeamsController {
  constructor(private teamsService: TeamsService) {}

  @Get()
  findAll(@Req() req: Request) {
    const { user } = req as any;
    if (user.role === "admin") {
      return this.teamsService.findAll();
    }
    return this.teamsService.findByLeader(user.userId);
  }

  @Get(":id")
  @Roles("admin")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.teamsService.findOne(id);
  }

  @Post()
  @Roles("admin")
  create(@Body() body: any) {
    return this.teamsService.create(body);
  }

  @Put(":id")
  @Roles("admin")
  update(@Param("id", ParseIntPipe) id: number, @Body() body: any) {
    return this.teamsService.update(id, body);
  }

  @Delete(":id")
  @Roles("admin")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.teamsService.remove(id);
  }

  @Post(":id/members")
  @Roles("admin")
  addMember(@Param("id", ParseIntPipe) teamId: number, @Body() member: any) {
    return this.teamsService.addMember(teamId, member);
  }
}
