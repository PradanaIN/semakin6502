import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  Query,
  Param,
  ParseIntPipe,
  Put,
  Delete,
} from "@nestjs/common";
import { Request } from "express";
import { PenugasanService } from "./penugasan.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { AuthRequestUser } from "../common/auth-request-user.interface";
import { AssignPenugasanDto } from "./dto/assign-penugasan.dto";
import { AssignPenugasanBulkDto } from "./dto/assign-penugasan-bulk.dto";

@Controller("penugasan")
@UseGuards(JwtAuthGuard, RolesGuard)
export class PenugasanController {
  constructor(private readonly penugasanService: PenugasanService) {}

  @Post()
  assign(@Body() body: AssignPenugasanDto, @Req() req: Request) {
    const u = req.user as AuthRequestUser;
    return this.penugasanService.assign(body, u.userId, u.role);
  }

  @Post("bulk")
  assignBulk(@Body() body: AssignPenugasanBulkDto, @Req() req: Request) {
    const u = req.user as AuthRequestUser;
    return this.penugasanService.assignBulk(body, u.userId, u.role);
  }

  @Get()
  findAll(
    @Req() req: Request,
    @Query("bulan") bulan?: string,
    @Query("tahun") tahun?: string,
  ) {
    const u = req.user as AuthRequestUser;
    const filter: any = {};
    if (bulan) filter.bulan = bulan;
    if (tahun) filter.tahun = parseInt(tahun, 10);
    return this.penugasanService.findAll(u.role, u.userId, filter);
  }

  @Get(":id")
  detail(@Param("id", ParseIntPipe) id: number, @Req() req: Request) {
    const u = req.user as AuthRequestUser;
    return this.penugasanService.findOne(id, u.role, u.userId);
  }

  @Put(":id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: AssignPenugasanDto,
    @Req() req: Request,
  ) {
    const u = req.user as AuthRequestUser;
    return this.penugasanService.update(id, body, u.userId, u.role);
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number, @Req() req: Request) {
    const u = req.user as AuthRequestUser;
    return this.penugasanService.remove(id, u.userId, u.role);
  }
}
