import {
  GetScheduleDto,
  ResponseDto,
  RoleName,
  Roles,
  User,
} from '@class-operation/libs';
import { Controller, Get, HttpStatus, Param, Query } from '@nestjs/common';
import { ScheduleService } from './schedule.service';

@Controller('schedules')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get('/')
  @Roles(
    RoleName.ADMIN,
    RoleName.MANAGE,
    RoleName.TEACHER_PART_TIME,
    RoleName.TEACHER_FULL_TIME,
  )
  async findByRangeDate(
    @Query() query: GetScheduleDto,
    @User('userId') userId: string,
    @User('role') role: RoleName,
  ) {
    const result = await this.scheduleService.findByRangeDate(
      query,
      userId,
      role,
    );

    return new ResponseDto(
      HttpStatus.OK,
      'Schedules retrieved successfully',
      result,
    );
  }

  @Get('/:id')
  @Roles(RoleName.ADMIN, RoleName.TEACHER_FULL_TIME)
  async findById(@Param('id') id: string) {
    const result = await this.scheduleService.findById(id);

    return new ResponseDto(
      HttpStatus.OK,
      'Schedule retrieved successfully',
      result,
    );
  }
}
