import {
  ClassDto,
  CreateClassDto,
  Pagination,
  QueryClassDto,
  ResponseDto,
  RoleName,
  Roles,
  UpdateClassDto,
  UserDto,
} from '@class-operation/libs';
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
import { ClassService } from './class.service';

@Controller('classes')
export class ClassController {
  constructor(private readonly classService: ClassService) {}

  @Get('/')
  @Roles(RoleName.ADMIN)
  async find(@Query() queryParams: QueryClassDto) {
    const {
      page,
      limit,
      total,
      data: classes,
    } = await this.classService.query(queryParams, {
      // relations: ['teacher'],
    });

    const results: Pagination<ClassDto> = {
      page,
      limit,
      total,
      items: ClassDto.plainToInstance(classes, ['admin']),
    };

    return new ResponseDto(HttpStatus.OK, 'Success', results);
  }

  @Get('/:id')
  @Roles(RoleName.ADMIN)
  async findById(@Param('id') id: string) {
    const classEntity = await this.classService.findById(id);

    return new ResponseDto(
      HttpStatus.OK,
      'Success',
      ClassDto.plainToInstance(classEntity, ['admin']),
    );
  }

  @Get('/:id/students')
  @Roles(RoleName.ADMIN)
  async findStudentsByClassId(@Param('id') id: string) {
    const students = await this.classService.findStudentsByClassId(id);

    return new ResponseDto(
      HttpStatus.OK,
      'Success',
      UserDto.plainToInstance(students, ['admin']),
    );
  }

  @Post('/')
  @Roles(RoleName.ADMIN)
  async create(@Body() createClassDto: CreateClassDto) {
    const classEntity = await this.classService.create(createClassDto);

    return new ResponseDto(
      HttpStatus.CREATED,
      'Created a new class',
      ClassDto.plainToInstance(classEntity, ['admin']),
    );
  }

  @Put('/:id')
  @Roles(RoleName.ADMIN)
  async updateById(
    @Param('id') id: string,
    @Body() updateClassDto: UpdateClassDto,
  ) {
    const classEntity = await this.classService.updateById(id, updateClassDto);

    return new ResponseDto(
      HttpStatus.OK,
      'Updated a class',
      ClassDto.plainToInstance(classEntity, ['admin']),
    );
  }

  @Delete('/:id')
  @Roles(RoleName.ADMIN)
  async deleteById(@Param('id') id: string) {
    await this.classService.deleteById(id);

    return new ResponseDto(HttpStatus.OK, 'Deleted a class');
  }

  @Get('/:id/schedules')
  @Roles(
    RoleName.ADMIN,
    RoleName.MANAGE,
    RoleName.STAFF_ACADEMIC,
    RoleName.TEACHER_FULL_TIME,
    RoleName.TEACHER_PART_TIME,
  )
  async getSchedules(@Param('id') id: string) {
    const result = await this.classService.getSchedules(id);

    return new ResponseDto(
      HttpStatus.CREATED,
      'Created schedules successfully',
      result,
    );
  }
}
