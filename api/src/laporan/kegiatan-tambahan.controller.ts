import { Controller, Post, Get, Body, Query, UseGuards } from "@nestjs/common";
import { TambahanService } from "./kegiatan-tambahan.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";

@Controller("kegiatan-tambahan")
@UseGuards(JwtAuthGuard)
export class TambahanController {
  constructor(private readonly tambahanService: TambahanService) {}

  @Post()
  add(@Body() body: any) {
    return this.tambahanService.add(body);
  }

  @Get()
  getByUser(@Query("user_id") userId: number) {
    return this.tambahanService.getByUser(userId);
  }
}
