import { LoginRequestDto, LoginResponseDto, UserDto } from '@co/dtos';
import { JwtPayload } from '@co/types';
import { comparePassword } from '@co/utils';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService
  ) {}

  async login(loginRequestDto: LoginRequestDto): Promise<LoginResponseDto> {
    let { email, password } = loginRequestDto;
    email = email.toLowerCase();
    const user = await this.userService.findByEmail(loginRequestDto.email);
    if (!user) {
      throw new UnauthorizedException('Email or password is incorrect');
    }

    if (!user.status) {
      throw new UnauthorizedException('Your account is not active');
    }
    const isMatch = comparePassword(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Email or password is incorrect');
    }

    user.lastLogin = new Date();

    await this.userService.store(user);

    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
    };
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      user: UserDto.plainToInstance(user, ['private']),
      accessToken,
    };
  }
}
