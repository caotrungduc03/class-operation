import { Public, User } from '@co/decorators';
import { LoginRequestDto, ResponseDto, UserDto } from '@co/dtos';
import { Body, Controller, Get, HttpStatus, Post } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('/login')
  @Public()
  async login(@Body() loginRequestDto: LoginRequestDto) {
    const loginResponseDto = await this.authService.login(loginRequestDto);

    return new ResponseDto(HttpStatus.OK, 'User logged in', loginResponseDto);
  }

  @Get('/me')
  async getMe(@User('userId') userId: string) {
    const user = await this.userService.findById(userId, {
      relations: ['role'],
    });

    return new ResponseDto(
      HttpStatus.OK,
      'Success',
      UserDto.plainToInstance(user, ['private']),
    );
  }
}
