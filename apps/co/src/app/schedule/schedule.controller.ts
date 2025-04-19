import {
  GetScheduleDto,
  ResponseDto,
  RoleName,
  Roles,
  User,
} from '@class-operation/libs';
import { Controller, Get, HttpStatus, Query } from '@nestjs/common';
import { ScheduleService } from './schedule.service';

@Controller('schedules')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get('/')
  @Roles(RoleName.ADMIN, RoleName.TEACHER)
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
}
