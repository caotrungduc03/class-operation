import {
  ClassDto,
  CreateClassDto,
  Pagination,
  QueryClassDto,
  ResponseDto,
  RoleName,
  Roles,
  UpdateClassDto,
  User,
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
  @Roles(
    RoleName.ADMIN,
    RoleName.MANAGE,
    RoleName.STAFF_ACADEMIC,
    RoleName.TEACHER_FULL_TIME,
    RoleName.TEACHER_PART_TIME,
  )
  async find(@Query() queryParams: QueryClassDto) {
    const {
      page,
      limit,
      total,
      data: classes,
    } = await this.classService.query(queryParams, {
      relations: ['course', 'room', 'teacher', 'studentClasses'],
    });

    const results: Pagination<ClassDto> = {
      page,
      limit,
      total,
      items: ClassDto.plainToInstance(classes, ['admin']),
    };

    return new ResponseDto(HttpStatus.OK, 'Success', results);
  }

  @Get('/my-classes')
  @Roles(
    RoleName.STUDENT,
    RoleName.TEACHER_FULL_TIME,
    RoleName.TEACHER_PART_TIME,
  )
  async findMyClasses(
    @Query() queryParams: QueryClassDto,
    @User('userId') userId: string,
    @User('role') role: RoleName,
  ) {
    const {
      page,
      limit,
      total,
      data: classes,
    } = await this.classService.queryMyClasses(queryParams, userId, role);

    const results: Pagination<ClassDto> = {
      page,
      limit,
      total,
      items: ClassDto.plainToInstance(classes, ['admin']),
    };

    return new ResponseDto(HttpStatus.OK, 'Success', results);
  }

  @Get('/:id')
  @Roles(
    RoleName.ADMIN,
    RoleName.MANAGE,
    RoleName.STAFF_ACADEMIC,
    RoleName.TEACHER_FULL_TIME,
    RoleName.TEACHER_PART_TIME,
    RoleName.STUDENT,
  )
  async findById(@Param('id') id: string) {
    const classEntity = await this.classService.findById(id);

    return new ResponseDto(
      HttpStatus.OK,
      'Success',
      ClassDto.plainToInstance(classEntity, ['admin']),
    );
  }

  @Get('/:id/students')
  @Roles(RoleName.ADMIN, RoleName.STAFF_ACADEMIC)
  async findStudentsByClassId(
    @Query() query: Record<string, any>,
    @Param('id') id: string,
  ) {
    const { page, limit, total, data } =
      await this.classService.findStudentsByClassId(query, id);

    const results: Pagination<UserDto> = {
      page,
      limit,
      total,
      items: UserDto.plainToInstance(data, ['admin']),
    };

    return new ResponseDto(HttpStatus.OK, 'Success', results);
  }

  @Post('/')
  @Roles(RoleName.ADMIN, RoleName.STAFF_ACADEMIC)
  async create(@Body() createClassDto: CreateClassDto) {
    const classEntity = await this.classService.create(createClassDto);

    return new ResponseDto(
      HttpStatus.CREATED,
      'Created a new class',
      ClassDto.plainToInstance(classEntity, ['admin']),
    );
  }

  @Put('/:id')
  @Roles(RoleName.ADMIN, RoleName.STAFF_ACADEMIC)
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
  @Roles(RoleName.ADMIN, RoleName.STAFF_ACADEMIC)
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

  @Post('/:id/students/:studentId')
  @Roles(RoleName.ADMIN, RoleName.STAFF_ACADEMIC)
  async addStudentToClass(
    @Param('id') id: string,
    @Param('studentId') studentId: string,
  ) {
    await this.classService.addStudentToClass(id, studentId);

    return new ResponseDto(
      HttpStatus.OK,
      'Student added to class successfully',
    );
  }

  @Delete('/:id/students/:studentId')
  @Roles(RoleName.ADMIN, RoleName.STAFF_ACADEMIC)
  async removeStudentFromClass(
    @Param('id') id: string,
    @Param('studentId') studentId: string,
  ) {
    await this.classService.removeStudentFromClass(id, studentId);

    return new ResponseDto(
      HttpStatus.OK,
      'Student removed from class successfully',
    );
  }
}
