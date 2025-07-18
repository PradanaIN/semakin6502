import { Controller, Post, Body, Res } from "@nestjs/common";
import { Response } from "express";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";

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
    });
    return { user: result.user };
  }

  @Post("logout")
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie("token");
    return { message: "Logged out" };
  }
}
