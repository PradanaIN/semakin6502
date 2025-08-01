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
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/guards/roles.decorator";
import { ROLES } from "../common/roles.constants";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { Request } from "express";
import { AuthRequestUser } from "../common/auth-request-user.interface";

@Controller("users")
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @Roles(ROLES.ADMIN, ROLES.KETUA)
  findAll() {
    return this.usersService.findAll();
  }

  @Get(":id")
  @Roles(ROLES.ADMIN)
  findOne(@Param("id") id: string) {
    return this.usersService.findOne(id);
  }

  @Get("profile")
  getProfile(@Req() req: Request) {
    const { userId } = req.user as AuthRequestUser;
    return this.usersService.findProfile(userId);
  }

  @Put("profile")
  updateProfile(@Req() req: Request, @Body() body: UpdateUserDto) {
    const { userId, role } = req.user as AuthRequestUser;
    const data = { ...body } as any;
    if (role !== ROLES.ADMIN) delete data.role;
    return this.usersService.updateProfile(userId, data);
  }

  @Post()
  @Roles(ROLES.ADMIN)
  create(@Body() body: CreateUserDto) {
    return this.usersService.create(body);
  }

  @Put(":id")
  @Roles(ROLES.ADMIN)
  update(@Param("id") id: string, @Body() body: UpdateUserDto) {
    return this.usersService.update(id, body);
  }

  @Delete(":id")
  @Roles(ROLES.ADMIN)
  remove(@Param("id") id: string) {
    return this.usersService.remove(id);
  }
}
