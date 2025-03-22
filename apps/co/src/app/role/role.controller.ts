import { ROLE_NAME } from '@co/constants';
import { Roles } from '@co/decorators';
import { CreateRoleDto, ResponseDto, RoleDto, UpdateRoleDto } from '@co/dtos';
import { Pagination } from '@co/types';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { RoleService } from './role.service';

@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get('/')
  @Roles(ROLE_NAME.ADMIN)
  async find(@Query() queryObj: Object) {
    const {
      page,
      limit,
      total,
      data: roles,
    } = await this.roleService.query(queryObj);

    const results: Pagination<RoleDto> = {
      page,
      limit,
      total,
      items: RoleDto.plainToInstance(roles, ['admin']),
    };

    return new ResponseDto(HttpStatus.OK, 'Success', results);
  }

  @Get('/:id')
  @Roles(ROLE_NAME.ADMIN)
  async findById(@Param('id') id: string) {
    const role = await this.roleService.findById(id);

    return new ResponseDto(
      HttpStatus.OK,
      'Success',
      RoleDto.plainToInstance(role, ['admin'])
    );
  }

  @Post('/')
  @Roles(ROLE_NAME.ADMIN)
  async create(@Body() createRoleDto: CreateRoleDto) {
    const role = await this.roleService.create(
      CreateRoleDto.plainToClass(createRoleDto)
    );

    return new ResponseDto(
      HttpStatus.CREATED,
      'Created a new role',
      RoleDto.plainToInstance(role, ['admin'])
    );
  }

  @Put('/:id')
  @Roles(ROLE_NAME.ADMIN)
  async updateById(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto
  ) {
    const role = await this.roleService.updateById(
      id,
      UpdateRoleDto.plainToClass(updateRoleDto)
    );

    return new ResponseDto(
      HttpStatus.OK,
      'Updated a role',
      RoleDto.plainToInstance(role, ['admin'])
    );
  }

  @Delete('/:id')
  @Roles(ROLE_NAME.ADMIN)
  async deleteById(@Param('id') id: string) {
    await this.roleService.deleteById(id);

    return new ResponseDto(HttpStatus.OK, 'Deleted a role');
  }
}
