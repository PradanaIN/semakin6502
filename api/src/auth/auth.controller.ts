import { Controller, Post, Body, Res, Get, Req, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { AuthRequestUser } from "../common/auth-request-user.interface";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("login")
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const result = await this.authService.login(body.identifier, body.password);
    const domain = process.env.COOKIE_DOMAIN;
    const sameSite =
      (process.env.COOKIE_SAMESITE as
        | boolean
        | "lax"
        | "strict"
        | "none") || "lax";
    res.cookie("token", result.access_token, {
      httpOnly: true,
      sameSite,
      secure: process.env.NODE_ENV === "production",
      ...(domain ? { domain } : {}),
      ...(body.remember ? { maxAge: 30 * 24 * 60 * 60 * 1000 } : {}),
    });
    return { user: result.user };
  }

  @Post("logout")
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie("token");
    return { message: "Logged out" };
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  async me(@Req() req: Request) {
    const { userId } = req.user as AuthRequestUser;
    const user = await this.authService.me(userId);
    return { user };
  }
}
