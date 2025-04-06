import { ROLE_NAME } from '@co/constants';
import { Roles } from '@co/decorators';
import { ResponseDto, UserDto } from '@co/dtos';
import { Pagination } from '@co/types';
import { Controller, Get, HttpStatus, Query } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/teachers')
  @Roles(ROLE_NAME.ADMIN)
  async findTeachers(@Query() query: Object) {
    const { page, limit, total, data } = await this.userService.query({
      ...query,
      // role: ROLE_NAME.TEACHER,
    });
    const results: Pagination<UserDto> = {
      page,
      limit,
      total,
      items: UserDto.plainToInstance(data, ['admin']),
    };

    return new ResponseDto(HttpStatus.OK, 'Success', results);
  }

  @Get('/receptionists')
  @Roles(ROLE_NAME.ADMIN)
  async findReceptionists(@Query() query: Object) {
    const { page, limit, total, data } = await this.userService.query({
      ...query,
      role: ROLE_NAME.RECEPTIONIST,
    });
    const results: Pagination<UserDto> = {
      page,
      limit,
      total,
      items: UserDto.plainToInstance(data, ['admin']),
    };

    return new ResponseDto(HttpStatus.OK, 'Success', results);
  }
}
