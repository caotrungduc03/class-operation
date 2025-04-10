import {
  LoginRequestDto,
  Public,
  ResponseDto,
  UpdateProfileDto,
  User,
  UserDto,
} from '@class-operation/libs';
import { Body, Controller, Get, HttpStatus, Patch, Post } from '@nestjs/common';
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

  @Get('/my-profile')
  async getMe(@User('userId') userId: string) {
    const user = await this.userService.findById(userId, {
      relations: ['role', 'detail'],
    });

    return new ResponseDto(
      HttpStatus.OK,
      'Success',
      UserDto.plainToInstance(user),
    );
  }

  @Patch('/update-profile')
  async updateProfile(
    @User('userId') userId: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    const updatedUser = await this.authService.updateProfile(
      userId,
      updateProfileDto,
    );

    return new ResponseDto(
      HttpStatus.OK,
      'Profile updated successfully',
      UserDto.plainToInstance(updatedUser),
    );
  }
}
