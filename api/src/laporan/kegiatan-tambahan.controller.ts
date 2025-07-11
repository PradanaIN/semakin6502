import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
} from "@nestjs/common";
import { TambahanService } from "./kegiatan-tambahan.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { AddTambahanDto } from "./dto/add-tambahan.dto";

@Controller("kegiatan-tambahan")
@UseGuards(JwtAuthGuard)
export class TambahanController {
  constructor(private readonly tambahanService: TambahanService) {}

  @Post()
  add(@Body() body: AddTambahanDto) {
    return this.tambahanService.add(body);
  }

  @Get()
  getByUser(@Query("user_id", ParseIntPipe) userId: number) {
    return this.tambahanService.getByUser(userId);
  }
}
