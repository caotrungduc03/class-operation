import { ResponseDto, RoleName, Roles, User } from '@class-operation/libs';
import { Controller, Get, HttpStatus, Query } from '@nestjs/common';
import { GetWeeklyNormDto } from '../../../../../libs/src/lib/dtos/weekly-norm/get-weekly-norm.dto';
import { WeeklyNormService } from './weekly-norm.service';

@Controller('weekly-norms')
export class WeeklyNormController {
  constructor(private readonly weeklyNormService: WeeklyNormService) {}

  @Get('/')
  @Roles(RoleName.ADMIN, RoleName.TEACHER)
  async findByRangeDate(
    @Query() query: GetWeeklyNormDto,
    @User('userId') userId: string,
    @User('role') role: RoleName,
  ) {
    const result = await this.weeklyNormService.findByRangeDate(
      query,
      userId,
      role,
    );

    return new ResponseDto(
      HttpStatus.OK,
      'Weekly norms retrieved successfully',
      result,
    );
  }
}
