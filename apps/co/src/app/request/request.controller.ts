import {
  CreateRequestWeeklyNormDto,
  Pagination,
  RequestAction,
  RequestDto,
  RequestType,
  ResponseDto,
  RoleName,
  Roles,
  ScheduleType,
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
    @Body() createRequestDto: CreateRequestWeeklyNormDto,
  ) {
    const request = await this.requestService.createWeeklyNorms(
      createRequestDto,
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
  async findWeeklyNorms(@Query() queryObj: Record<string, any>) {
    const { page, limit, total, data } = await this.requestService.query(
      { ...queryObj, type: RequestType.WEEKLY_NORM },
      {
        relations: ['weeklyNorms', 'creator', 'requester', 'approver'],
      },
    );

    const results: Pagination<any> = {
      page,
      limit,
      total,
      items: RequestDto.plainToInstance(data, ['admin']),
    };

    return new ResponseDto(HttpStatus.OK, 'Success', results);
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
    @Body() updateData: CreateRequestWeeklyNormDto,
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

  @Patch('weekly-norms/:id/update-status')
  @Roles(RoleName.ADMIN, RoleName.TEACHER)
  async updateWeeklyNormStatus(
    @Param('id') id: string,
    @User('userId') userId: string,
    @User('role') role: RoleName,
    @Body() body: { action: RequestAction },
  ) {
    if (body.action === RequestAction.APPROVE) {
      // Only admins can approve
      if (role !== RoleName.ADMIN) {
        throw new ForbiddenException('Only admins can approve requests');
      }
    }

    const updatedRequest = await this.requestService.updateWeeklyNormStatus(
      id,
      body.action,
      body.action === RequestAction.APPROVE ? userId : undefined,
    );

    return new ResponseDto(
      HttpStatus.OK,
      `Weekly norm request ${RequestAction.APPROVE} successfully`,
      updatedRequest,
    );
  }

  @Post('time-offs')
  @Roles(RoleName.ADMIN, RoleName.TEACHER)
  async createTimeOff(
    @User('userId') userId: string,
    @User('role') role: RoleName,
    @Body()
    createScheduleDto: {
      name: string;
      description: string;
      type: ScheduleType;
      startDate: Date;
      endDate: Date;
    },
  ) {
    const result = await this.requestService.createTimeOffSchedule(
      createScheduleDto,
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
  async findTimeOff(@Query() queryObj: Object) {
    const { page, limit, total, data } = await this.requestService.query(
      {
        ...queryObj,
        type: RequestType.TIME_OFF,
      },
      {
        relations: ['weeklyNorms', 'creator', 'requester', 'approver'],
      },
    );

    const results: Pagination<any> = {
      page,
      limit,
      total,
      items: RequestDto.plainToInstance(data, ['admin']),
    };

    return new ResponseDto(HttpStatus.OK, 'Success', results);
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
    @Body()
    updateData: {
      name: string;
      description: string;
      type: ScheduleType;
      startDate: Date;
      endDate: Date;
    },
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

  @Patch('time-offs/:id/update-status')
  @Roles(RoleName.ADMIN, RoleName.TEACHER)
  async updateTimeOffStatus(
    @Param('id') id: string,
    @User('userId') userId: string,
    @User('role') role: RoleName,
    @Body() body: { action: RequestAction },
  ) {
    if (body.action === RequestAction.APPROVE) {
      // Only admins can approve
      if (role !== RoleName.ADMIN) {
        throw new ForbiddenException('Only admins can approve requests');
      }
    }

    const updatedRequest = await this.requestService.updateTimeOffStatus(
      id,
      body.action,
      body.action === RequestAction.APPROVE ? userId : undefined,
    );

    return new ResponseDto(
      HttpStatus.OK,
      `Time off schedule request ${body.action} successfully`,
      updatedRequest,
    );
  }
}
