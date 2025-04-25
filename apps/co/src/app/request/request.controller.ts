import {
  CreateBusySchedulesRequestDto,
  CreateTimeOffRequestDto,
  CreateWeeklyNormRequestDto,
  GetRequestDto,
  RequestAction,
  RequestDto,
  RequestType,
  ResponseDto,
  RoleName,
  Roles,
  UpdateBusySchedulesRequestDto,
  UpdateTimeOffRequestDto,
  UpdateWeeklyNormRequestDto,
  User,
} from '@class-operation/libs';
import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { WeeklyNormService } from '../weekly-norm/weekly-norm.service';
import { RequestService } from './request.service';

@Controller('requests')
export class RequestController {
  constructor(
    private readonly requestService: RequestService,
    private readonly weeklyNormService: WeeklyNormService,
  ) {}

  @Post('weekly-norms')
  @Roles(RoleName.ADMIN, RoleName.TEACHER)
  async createWeekNorm(
    @User('userId') userId: string,
    @User('role') role: RoleName,
    @Body() requestDto: CreateWeeklyNormRequestDto,
  ) {
    const request = await this.requestService.createWeeklyNorms(
      requestDto,
      userId,
      role,
    );

    return new ResponseDto(
      HttpStatus.CREATED,
      'Request created successfully',
      request,
    );
  }

  @Get('weekly-norms')
  @Roles(RoleName.ADMIN, RoleName.TEACHER)
  async findWeeklyNorms(@Query() queryObj: GetRequestDto) {
    const { page, limit, total, data } = await this.requestService.query(
      {
        ...queryObj,
        type: RequestType.WEEKLY_NORM,
      },
      {
        relations: ['weeklyNorms', 'creator', 'requester', 'approver'],
      },
    );

    return new ResponseDto(HttpStatus.OK, 'Success', {
      page,
      limit,
      total,
      items: RequestDto.plainToInstance(data, ['admin']),
    });
  }

  @Get('weekly-norms/:id')
  @Roles(RoleName.ADMIN, RoleName.TEACHER)
  async findWeeklyNormById(@Param('id') id: string) {
    const request = await this.requestService.findOne({
      where: { id },
      relations: ['weeklyNorms', 'creator', 'requester', 'approver'],
    });

    if (!request) {
      throw new NotFoundException('Weekly norm request not found');
    }

    return new ResponseDto(
      HttpStatus.OK,
      'Success',
      RequestDto.plainToInstance(request, ['admin']),
    );
  }

  @Put('weekly-norms/:id')
  @Roles(RoleName.ADMIN, RoleName.TEACHER)
  async updateWeeklyNormById(
    @Param('id') id: string,
    @Body() updateData: UpdateWeeklyNormRequestDto,
    @User('role') role: RoleName,
  ) {
    const updatedRequest = await this.requestService.updateWeeklyNorm(
      id,
      updateData,
      role,
    );

    return new ResponseDto(
      HttpStatus.OK,
      'Weekly norm request updated successfully',
      updatedRequest,
    );
  }

  @Patch('weekly-norms/:id/status')
  @Roles(RoleName.ADMIN, RoleName.TEACHER)
  async updateWeeklyNormStatus(
    @Param('id') id: string,
    @User('userId') userId: string,
    @User('role') role: RoleName,
    @Body('action') action: RequestAction,
  ) {
    if (action === RequestAction.APPROVE) {
      // Only admins can approve
      if (role !== RoleName.ADMIN) {
        throw new ForbiddenException('Only admins can approve requests');
      }
    }

    const updatedRequest = await this.requestService.updateWeeklyNormStatus(
      id,
      action,
      action === RequestAction.APPROVE ? userId : undefined,
    );

    return new ResponseDto(
      HttpStatus.OK,
      `Weekly norm request ${action} successfully`,
      updatedRequest,
    );
  }

  @Post('time-offs')
  @Roles(RoleName.ADMIN, RoleName.TEACHER)
  async createTimeOff(
    @User('userId') userId: string,
    @User('role') role: RoleName,
    @Body() timeOffDto: CreateTimeOffRequestDto,
  ) {
    const result = await this.requestService.createTimeOffSchedule(
      timeOffDto,
      userId,
      role,
    );

    return new ResponseDto(
      HttpStatus.CREATED,
      'Time off schedule request created successfully',
      result.request,
    );
  }

  @Get('time-offs')
  @Roles(RoleName.ADMIN, RoleName.TEACHER)
  async findTimeOff(@Query() queryObj: GetRequestDto) {
    const { page, limit, total, data } = await this.requestService.query(
      {
        ...queryObj,
        type: RequestType.TIME_OFF,
      },
      {
        relations: ['weeklyNorms', 'creator', 'requester', 'approver'],
      },
    );

    return new ResponseDto(HttpStatus.OK, 'Success', {
      page,
      limit,
      total,
      items: RequestDto.plainToInstance(data, ['admin']),
    });
  }

  @Get('time-offs/:id')
  @Roles(RoleName.ADMIN, RoleName.TEACHER)
  async findTimeOffById(@Param('id') id: string) {
    const request = await this.requestService.getTimeOffScheduleById(id);
    return new ResponseDto(
      HttpStatus.OK,
      'Success',
      RequestDto.plainToInstance(request, ['admin']),
    );
  }

  @Put('time-offs/:id')
  @Roles(RoleName.ADMIN, RoleName.TEACHER)
  async updateTimeOffById(
    @Param('id') id: string,
    @Body() updateData: UpdateTimeOffRequestDto,
  ) {
    const updatedRequest = await this.requestService.updateTimeOffSchedule(
      id,
      updateData,
    );

    return new ResponseDto(
      HttpStatus.OK,
      'Time off schedule request updated successfully',
      updatedRequest,
    );
  }

  @Patch('time-offs/:id/status')
  @Roles(RoleName.ADMIN, RoleName.TEACHER)
  async updateTimeOffStatus(
    @Param('id') id: string,
    @User('userId') userId: string,
    @User('role') role: RoleName,
    @Body('action') action: RequestAction,
  ) {
    if (action === RequestAction.APPROVE) {
      // Only admins can approve
      if (role !== RoleName.ADMIN) {
        throw new ForbiddenException('Only admins can approve requests');
      }
    }

    const updatedRequest = await this.requestService.updateTimeOffStatus(
      id,
      action,
      action === RequestAction.APPROVE ? userId : undefined,
    );

    return new ResponseDto(
      HttpStatus.OK,
      `Time off schedule request ${action} successfully`,
      updatedRequest,
    );
  }

  @Post('busy-schedules')
  @Roles(RoleName.ADMIN, RoleName.TEACHER)
  async createBusySchedule(
    @User('userId') userId: string,
    @User('role') role: RoleName,
    @Body() busySchedulesDto: CreateBusySchedulesRequestDto,
  ) {
    const result = await this.requestService.createBusySchedule(
      busySchedulesDto,
      userId,
      role,
    );

    return new ResponseDto(
      HttpStatus.CREATED,
      'Busy schedule request created successfully',
      result.request,
    );
  }

  @Get('busy-schedules')
  @Roles(RoleName.ADMIN, RoleName.TEACHER)
  async findBusySchedule(@Query() queryObj: GetRequestDto) {
    const { page, limit, total, data } = await this.requestService.query(
      {
        ...queryObj,
        type: RequestType.BUSY_SCHEDULE,
      },
      {
        relations: ['weeklyNorms', 'creator', 'requester', 'approver'],
      },
    );

    return new ResponseDto(HttpStatus.OK, 'Success', {
      page,
      limit,
      total,
      items: RequestDto.plainToInstance(data, ['admin']),
    });
  }

  @Get('busy-schedules/:id')
  @Roles(RoleName.ADMIN, RoleName.TEACHER)
  async getBusyScheduleById(@Param('id') id: string) {
    const request = await this.requestService.getBusyScheduleById(id);
    return new ResponseDto(
      HttpStatus.OK,
      'Success',
      RequestDto.plainToInstance(request, ['admin']),
    );
  }

  @Put('busy-schedules/:id')
  @Roles(RoleName.ADMIN, RoleName.TEACHER)
  async updateBusySchedule(
    @Param('id') id: string,
    @Body() updateData: UpdateBusySchedulesRequestDto,
  ) {
    const updatedRequest = await this.requestService.updateBusySchedule(
      id,
      updateData,
    );
    return new ResponseDto(
      HttpStatus.OK,
      'Busy schedule request updated successfully',
      updatedRequest,
    );
  }

  @Patch('busy-schedules/:id/status')
  @Roles(RoleName.ADMIN, RoleName.TEACHER)
  async updateBusyScheduleStatus(
    @Param('id') id: string,
    @User('userId') userId: string,
    @User('role') role: RoleName,
    @Body('action') action: RequestAction,
  ) {
    if (action === RequestAction.APPROVE) {
      // Only admins can approve
      if (role !== RoleName.ADMIN) {
        throw new ForbiddenException('Only admins can approve requests');
      }
    }

    const updatedRequest = await this.requestService.updateBusyScheduleStatus(
      id,
      action,
      action === RequestAction.APPROVE ? userId : undefined,
    );

    return new ResponseDto(
      HttpStatus.OK,
      `Busy schedule request ${action} successfully`,
      updatedRequest,
    );
  }
}
