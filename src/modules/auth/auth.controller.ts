import { IsPublic } from '@/common/decorators/auth.decorator'
import { UserAgent } from '@/common/decorators/user-agent.decorator'
import envConfig from '@/config/env.config'
import {
  ForgotPasswordBodyDTO,
  GetAuthorizationUrlResDTO,
  LoginBodyDTO,
  LoginResDTO,
  LogoutBodyDTO,
  RefreshTokenBodyDTO,
  RefreshTokenResDTO,
  RegisterBodyDTO,
  RegisterResDTO
} from '@/modules/auth/auth.dto'
import { MessageResDTO } from '@/shared/dtos/response.dto'
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
  Query,
  Res,
  UseInterceptors
} from '@nestjs/common'
import { AnyFilesInterceptor } from '@nestjs/platform-express'
import { ApiBearerAuth, ApiBody, ApiConsumes } from '@nestjs/swagger'
import { Response } from 'express'
import { ZodSerializerDto } from 'nestjs-zod'
import { AuthService } from './auth.service'
import { RegisterMultipartSwaggerDTO } from './dto/auth.dto'
import { GoogleService } from './google.service'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly googleService: GoogleService
  ) {}

  // @Post('otp')
  // @IsPublic()
  // @ZodSerializerDto(MessageResDTO)
  // sendOTP(@Body() body: SendOTPBodyDTO) {
  //   return this.authService.sendOTP(body)
  // }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @IsPublic()
  @ZodSerializerDto(LoginResDTO)
  login(@Body() body: LoginBodyDTO, @UserAgent() userAgent: string, @Ip() ip: string) {
    return this.authService.login({
      ...body,
      userAgent,
      ip
    })
  }

  @Post('register')
  @IsPublic()
  @ZodSerializerDto(RegisterResDTO)
  @UseInterceptors(AnyFilesInterceptor())
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: RegisterMultipartSwaggerDTO }) // dùng class để render form đẹp
  register(
    @Body() body: RegisterBodyDTO,
    @UserAgent() userAgent: string,
    @Ip() ip: string
  ) {
    return this.authService.register(body, userAgent, ip)
  }

  @Post('refresh-token')
  @ApiBearerAuth()
  @IsPublic()
  @ZodSerializerDto(RefreshTokenResDTO)
  refreshToken(
    @Body() body: RefreshTokenBodyDTO,
    @UserAgent() userAgent: string,
    @Ip() ip: string
  ) {
    return this.authService.refreshToken({
      refreshToken: body.refreshToken,
      userAgent,
      ip
    })
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ZodSerializerDto(MessageResDTO)
  logout(@Body() body: LogoutBodyDTO) {
    return this.authService.logout(body.refreshToken)
  }

  @Post('forgot-password')
  @IsPublic()
  @ZodSerializerDto(MessageResDTO)
  forgotPassword(@Body() body: ForgotPasswordBodyDTO) {
    return this.authService.forgotPassword(body)
  }

  // @Get('me')
  // @ZodSerializerDto(GetAccountProfileResDTO)
  // me(@ActiveUser('userId') userId: number) {
  //   return this.authService.getMe(userId)
  // }

  // @Put('me')
  // @ZodSerializerDto(AccountResDTO)
  // updateMe(@Body() body: UpdateMeBodyDTO, @ActiveUser('userId') userId: number) {
  //   return this.authService.updateMe({
  //     userId,
  //     data: body
  //   })
  // }

  //oauth
  @Get('google-link')
  @IsPublic()
  @ZodSerializerDto(GetAuthorizationUrlResDTO)
  getAuthorizationUrl(@UserAgent() userAgent: string, @Ip() ip: string) {
    return this.googleService.getAuthorizationUrl({ userAgent, ip })
  }

  @Get('google/callback')
  @IsPublic()
  async googleCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response
  ) {
    try {
      const data = await this.googleService.googleCallback({ code, state })
      return res.redirect(
        `${envConfig.GOOGLE_CLIENT_REDIRECT_URI}?accessToken=${data.accessToken}&refreshToken=${data.refreshToken}`
      )
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Đã xảy ra lỗi khi đăng nhập bằng Google, vui lòng thử lại bằng cách khác'
      return res.redirect(
        `${envConfig.GOOGLE_CLIENT_REDIRECT_URI}?errorMessage=${message}`
      )
    }
  }
}
