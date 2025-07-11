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
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/guards/roles.decorator";

@Controller("users")
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @Roles("admin")
  findAll() {
    return this.usersService.findAll();
  }

  @Get(":id")
  @Roles("admin")
  findOne(@Param("id") id: number) {
    return this.usersService.findOne(id);
  }

  @Post()
  @Roles("admin")
  create(@Body() body: any) {
    return this.usersService.create(body);
  }

  @Put(":id")
  @Roles("admin")
  update(@Param("id") id: number, @Body() body: any) {
    return this.usersService.update(id, body);
  }

  @Delete(":id")
  @Roles("admin")
  remove(@Param("id") id: number) {
    return this.usersService.remove(id);
  }
}
