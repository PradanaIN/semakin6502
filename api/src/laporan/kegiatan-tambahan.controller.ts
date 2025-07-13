import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  Param,
  ParseIntPipe,
  Put,
  Delete,
} from "@nestjs/common";
import { Request } from "express";
import { TambahanService } from "./kegiatan-tambahan.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { AddTambahanDto } from "./dto/add-tambahan.dto";
import { UpdateTambahanDto } from "./dto/update-tambahan.dto";

@Controller("kegiatan-tambahan")
@UseGuards(JwtAuthGuard)
export class TambahanController {
  constructor(private readonly tambahanService: TambahanService) {}

  @Post()
  add(@Body() body: AddTambahanDto, @Req() req: Request) {
    const userId = (req.user as any).userId;
    return this.tambahanService.add({ ...body, userId });
  }

  @Get()
  getByUser(@Req() req: Request) {
    const userId = (req.user as any).userId;
    return this.tambahanService.getByUser(userId);
  }

  @Get(":id")
  detail(@Param("id", ParseIntPipe) id: number, @Req() req: Request) {
    const userId = (req.user as any).userId;
    return this.tambahanService.getOne(id, userId);
  }

  @Put(":id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: UpdateTambahanDto,
    @Req() req: Request,
  ) {
    const userId = (req.user as any).userId;
    return this.tambahanService.update(id, body, userId);
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number, @Req() req: Request) {
    const userId = (req.user as any).userId;
    return this.tambahanService.remove(id, userId);
  }
}
