import { ROLE_NAME } from '@co/constants';
import { Roles } from '@co/decorators';
import { ResponseDto, UserDto } from '@co/dtos';
import { Pagination } from '@co/types';
import { Controller, Get, HttpStatus, Query } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/')
  @Roles(ROLE_NAME.ADMIN)
  async find(@Query() query: Object) {
    const { page, limit, total, data } = await this.userService.query(query);
    const results: Pagination<UserDto> = {
      page,
      limit,
      total,
      items: UserDto.plainToInstance(data, ['admin']),
    };

    return new ResponseDto(HttpStatus.OK, 'Success', results);
  }
}
