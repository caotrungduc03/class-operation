import {
  CreateUserDto,
  Pagination,
  ResponseDto,
  RoleName,
  Roles,
  UserDto,
} from '@class-operation/libs';
import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/teachers')
  @Roles(RoleName.ADMIN)
  async findTeachers(@Query() query: Record<string, any>) {
    const { page, limit, total, data } =
      await this.userService.findUsersByRoleName(
        RoleName.TEACHER_FULL_TIME,
        query,
      );

    const results: Pagination<UserDto> = {
      page,
      limit,
      total,
      items: UserDto.plainToInstance(data, ['admin']),
    };

    return new ResponseDto(HttpStatus.OK, 'Success', results);
  }

  @Get('/receptionists')
  @Roles(RoleName.ADMIN)
  async findReceptionists(@Query() query: Record<string, any>) {
    const { page, limit, total, data } =
      await this.userService.findUsersByRoleName(RoleName.RECEPTIONIST, query);

    const results: Pagination<UserDto> = {
      page,
      limit,
      total,
      items: UserDto.plainToInstance(data, ['admin']),
    };

    return new ResponseDto(HttpStatus.OK, 'Success', results);
  }

  @Post('/')
  @Roles(RoleName.ADMIN)
  async createUser(@Body(ValidationPipe) createUserDto: CreateUserDto) {
    const user = await this.userService.create(createUserDto);

    return new ResponseDto(
      HttpStatus.CREATED,
      'User created successfully',
      UserDto.plainToInstance(user, ['admin']),
    );
  }
}
