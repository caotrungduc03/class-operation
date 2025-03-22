import { Public } from '@co/decorators';
import {
  LoginRequestDto,
  RegisterRequestDto,
  ResponseDto,
  UserDto,
} from '@co/dtos';
import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService
  ) {}

  @Post('/register')
  @Public()
  async register(@Body() registerDto: RegisterRequestDto) {
    const user = await this.userService.create(registerDto);

    return new ResponseDto(
      HttpStatus.CREATED,
      'User created',
      UserDto.plainToInstance(user, ['private'])
    );
  }

  @Post('/login')
  @Public()
  async login(@Res() res: Response, @Body() loginRequestDto: LoginRequestDto) {
    const loginResponseDto = await this.authService.login(loginRequestDto);

    return res
      .status(HttpStatus.OK)
      .json(new ResponseDto(HttpStatus.OK, 'User logged in', loginResponseDto));
  }
}
