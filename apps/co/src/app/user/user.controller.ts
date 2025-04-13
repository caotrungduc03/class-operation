import {
  Pagination,
  ResponseDto,
  RoleName,
  Roles,
  UserDto,
} from '@class-operation/libs';
import { Controller, Get, HttpStatus, Query } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/teachers')
  @Roles(RoleName.ADMIN)
  async findTeachers(@Query() query: Object) {
    const { page, limit, total, data } =
      await this.userService.findUsersByRoleName(RoleName.TEACHER, query);

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
  async findReceptionists(@Query() query: Object) {
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
}
