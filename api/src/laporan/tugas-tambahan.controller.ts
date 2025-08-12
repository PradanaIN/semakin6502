import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  UsePipes,
  Req,
  Param,
  Query,
  Put,
  Delete,
  ValidationPipe,
} from "@nestjs/common";
import { Request } from "express";
import { TambahanService } from "./tugas-tambahan.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/guards/roles.decorator";
import { ROLES } from "../common/roles.constants";
import { AddTambahanDto } from "./dto/add-tambahan.dto";
import { UpdateTambahanDto } from "./dto/update-tambahan.dto";
import { SubmitTambahanLaporanDto } from "./dto/submit-tambahan-laporan.dto";
import { AuthRequestUser } from "../common/auth-request-user.interface";

@Controller("tugas-tambahan")
@UseGuards(JwtAuthGuard, RolesGuard)
export class TambahanController {
  constructor(private readonly tambahanService: TambahanService) {}

  @Post()
  @Roles(ROLES.ADMIN, ROLES.KETUA, ROLES.ANGGOTA)
  add(@Body() body: AddTambahanDto, @Req() req: Request) {
    const userId = (req.user as AuthRequestUser).userId;
    return this.tambahanService.add({ ...body, userId });
  }

  @Get()
  getByUser(@Req() req: Request) {
    const userId = (req.user as AuthRequestUser).userId;
    return this.tambahanService.getByUser(userId);
  }

  @Get('all')
  @Roles(ROLES.ADMIN, ROLES.PIMPINAN)
  getAll(
    @Query('teamId') teamId?: string,
    @Query('userId') userId?: string,
  ) {
    return this.tambahanService.getAll({ teamId, userId });
  }

  @Post(":id/laporan")
  @UsePipes(new ValidationPipe({ whitelist: true }))
  addLaporan(
    @Param("id") id: string,
    @Body() body: SubmitTambahanLaporanDto,
    @Req() req: Request
  ) {
    const u = req.user as AuthRequestUser;
    return this.tambahanService.addLaporan(id, body, u.userId, u.role);
  }

  @Get(":id")
  detail(@Param("id") id: string, @Req() req: Request) {
    const { userId, role } = req.user as AuthRequestUser;
    return this.tambahanService.getOne(id, userId, role);
  }

  @Put(":id")
  @Roles(ROLES.ADMIN, ROLES.KETUA, ROLES.ANGGOTA)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  update(
    @Param("id") id: string,
    @Body() body: UpdateTambahanDto,
    @Req() req: Request,
  ) {
    const userId = (req.user as AuthRequestUser).userId;
    return this.tambahanService.update(id, body, userId);
  }

  @Delete(":id")
  @Roles(ROLES.ADMIN, ROLES.KETUA, ROLES.ANGGOTA)
  remove(@Param("id") id: string, @Req() req: Request) {
    const userId = (req.user as AuthRequestUser).userId;
    return this.tambahanService.remove(id, userId);
  }
}
