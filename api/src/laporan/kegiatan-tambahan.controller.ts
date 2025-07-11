import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
} from "@nestjs/common";
import { Request } from "express";
import { TambahanService } from "./kegiatan-tambahan.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { AddTambahanDto } from "./dto/add-tambahan.dto";

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
}
