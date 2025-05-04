import {
  CreateBusySchedulesRequestDto,
  CreateTimeOffRequestDto,
  CreateWeeklyNormRequestDto,
  RequestAction,
  RequestEntity,
  RequestStatus,
  RequestType,
  RoleName,
  ScheduleType,
  UpdateBusySchedulesRequestDto,
  UpdateTimeOffRequestDto,
  UpdateWeeklyNormRequestDto,
  UserStatus,
} from '@class-operation/libs';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { pick } from 'lodash';
import { Repository } from 'typeorm';
import { BaseService } from '../../common';
import { ScheduleService } from '../schedule/schedule.service';
import { WeeklyNormService } from '../weekly-norm/weekly-norm.service';

@Injectable()
export class RequestService extends BaseService<RequestEntity> {
  constructor(
    @InjectRepository(RequestEntity)
    private readonly requestRepository: Repository<RequestEntity>,
    private readonly scheduleService: ScheduleService,
    private readonly weeklyNormService: WeeklyNormService,
  ) {
    super(requestRepository);
  }

  async createWeeklyNorms(
    createRequestDto: CreateWeeklyNormRequestDto,
    userId: string,
    role: RoleName,
  ) {
    let statusWeeklyNorm = false;
    switch (role) {
      case RoleName.ADMIN:
        createRequestDto.creatorId = userId;
        createRequestDto.status = RequestStatus.APPROVED;
        statusWeeklyNorm = true;
        break;
      case RoleName.TEACHER_FULL_TIME:
      case RoleName.TEACHER_PART_TIME:
        createRequestDto.teacherId = userId;
        createRequestDto.creatorId = userId;
        createRequestDto.status = RequestStatus.PENDING;
        break;
    }

    const request = await this.store({
      ...pick(createRequestDto, ['name', 'description', 'creatorId', 'status']),
      type: RequestType.WEEKLY_NORM,
    });

    const weeklyNorms = createRequestDto.weeklyNorms.map((norm) => {
      return {
        ...pick(norm, ['startDate', 'endDate', 'quantity']),
        teacherId: createRequestDto.teacherId,
        requestId: request.id,
        status: statusWeeklyNorm,
      };
    });

    await this.weeklyNormService.store(weeklyNorms);

    return request;
  }

  async updateWeeklyNorm(
    id: string,
    updateData: UpdateWeeklyNormRequestDto,
    role: RoleName,
  ) {
    // Find the request to update
    const request = await this.findOne({
      where: { id, type: RequestType.WEEKLY_NORM },
      relations: ['weeklyNorms'],
    });

    if (!request) {
      throw new NotFoundException('Weekly norm request not found');
    }

    // Only allow updates for PENDING requests
    if (request.status !== RequestStatus.PENDING) {
      throw new Error('Only pending requests can be updated');
    }

    // Update request basic info
    const updatedRequest = await this.store({
      ...request,
      name: updateData.name,
      description: updateData.description,
    });

    // Delete existing weekly norms using the repository directly
    if (request.weeklyNorms.length > 0) {
      await this.weeklyNormService.deleteByRequestId(request.id);
    }

    // Create new weekly norms
    const weeklyNorms = updateData?.weeklyNorms?.map((norm) => {
      return {
        ...pick(norm, ['startDate', 'endDate', 'quantity']),
        teacherId: updateData.teacherId,
        requestId: request.id,
        status: role === RoleName.ADMIN, // Only admin can create active weekly norms
      };
    });

    // Store new weekly norms
    await this.weeklyNormService.store(weeklyNorms);

    return updatedRequest;
  }

  async updateWeeklyNormStatus(
    id: string,
    action: RequestAction,
    userId?: string,
  ) {
    const request = await this.findOne({
      where: { id, type: RequestType.WEEKLY_NORM },
      relations: ['weeklyNorms'],
    });

    if (!request) {
      throw new NotFoundException('Weekly norm request not found');
    }

    // Handle based on action
    if (action === RequestAction.APPROVE) {
      // Check if request can be approved
      if (request.status !== RequestStatus.PENDING) {
        throw new BadRequestException('Only pending requests can be approved');
      }

      if (!userId) {
        throw new BadRequestException('User ID is required for approval');
      }

      // Check for overlapping active weekly norms
      if (request.weeklyNorms?.length > 0) {
        for (const norm of request.weeklyNorms) {
          const hasOverlap = await this.weeklyNormService.checkOverlappingNorms(
            norm.teacherId,
            norm.startDate,
            norm.endDate,
            request.id, // exclude current request's norms
          );

          if (hasOverlap) {
            throw new BadRequestException(
              `Cannot approve request. There is already an active weekly norm for teacher ID ${norm.teacherId} in the period from ${norm.startDate.toISOString().split('T')[0]} to ${norm.endDate.toISOString().split('T')[0]}.`,
            );
          }
        }
      }

      // Update request status and approverId
      const updatedRequest = await this.store({
        ...request,
        status: RequestStatus.APPROVED,
        approverId: userId,
      });

      // Update all weekly norms to active
      if (request.weeklyNorms?.length > 0) {
        await Promise.all(
          request.weeklyNorms.map((norm) =>
            this.weeklyNormService.update(norm.id, { status: true }),
          ),
        );
      }

      return updatedRequest;
    } else if (action === RequestAction.CANCEL) {
      // Check if request can be canceled
      if (request.status !== RequestStatus.APPROVED) {
        throw new BadRequestException('Only approved requests can be canceled');
      }

      // Update request status
      const updatedRequest = await this.store({
        ...request,
        status: RequestStatus.CANCELED,
      });

      // Update all weekly norms to inactive
      if (request.weeklyNorms?.length > 0) {
        await Promise.all(
          request.weeklyNorms.map((norm) =>
            this.weeklyNormService.update(norm.id, { status: false }),
          ),
        );
      }

      return updatedRequest;
    }

    throw new BadRequestException(
      `Invalid action: ${action}. Must be one of: ${Object.values(
        RequestAction,
      ).join(', ')}`,
    );
  }

  async createTimeOffSchedule(
    createScheduleDto: CreateTimeOffRequestDto,
    userId: string,
    role: RoleName,
  ) {
    // Determine initial status based on role
    const isAdmin = role === RoleName.ADMIN;
    const status = isAdmin ? RequestStatus.APPROVED : RequestStatus.PENDING;
    const scheduleStatus = isAdmin;

    // Create request first
    const request = await this.store({
      name: createScheduleDto.name,
      description: createScheduleDto.description,
      creatorId: userId,
      requesterId: isAdmin ? null : userId,
      type: RequestType.TIME_OFF,
      status: status,
    });

    // Create schedule using the service
    const schedule = await this.scheduleService.store({
      name: createScheduleDto.name,
      description: createScheduleDto.description,
      type: ScheduleType.BUSY,
      startDate: createScheduleDto.startDate,
      endDate: createScheduleDto.endDate,
      teacherId: isAdmin ? null : userId,
      requestId: request.id,
      status: scheduleStatus,
    });

    return { request, schedule };
  }

  async getTimeOffScheduleById(id: string) {
    const request = await this.findOne({
      where: { id, type: RequestType.TIME_OFF },
      relations: ['schedule', 'creator', 'requester', 'approver'],
    });

    if (!request) {
      throw new NotFoundException('Time off schedule request not found');
    }

    return request;
  }

  async updateTimeOffSchedule(id: string, updateData: UpdateTimeOffRequestDto) {
    const request = await this.findOne({
      where: { id, type: RequestType.TIME_OFF },
      relations: ['schedule'],
    });

    if (!request) {
      throw new NotFoundException('Time off schedule request not found');
    }

    // Only allow updates for PENDING requests
    if (request.status !== RequestStatus.PENDING) {
      throw new BadRequestException('Only pending requests can be updated');
    }

    // Update request
    const updatedRequest = await this.store({
      ...request,
      name: updateData.name,
      description: updateData.description,
    });

    // Update schedule using the service
    if (request.schedule) {
      await this.scheduleService.updateById(request.schedule.id, {
        name: updateData.name,
        description: updateData.description,
        startDate: updateData.startDate,
        endDate: updateData.endDate,
      });
    }

    return updatedRequest;
  }

  async updateTimeOffStatus(
    id: string,
    action: RequestAction,
    userId?: string,
  ) {
    const request = await this.findOne({
      where: { id, type: RequestType.TIME_OFF },
      relations: ['schedule'],
    });

    if (!request) {
      throw new NotFoundException('Time off schedule request not found');
    }

    if (action === RequestAction.APPROVE) {
      if (request.status !== RequestStatus.PENDING) {
        throw new BadRequestException('Only pending requests can be approved');
      }

      if (!userId) {
        throw new BadRequestException('User ID is required for approval');
      }

      // Check for overlapping schedules if needed
      if (request.schedule && request.schedule.teacherId) {
        const hasOverlap = await this.scheduleService.checkOverlappingSchedules(
          request.schedule.teacherId,
          request.schedule.startDate,
          request.schedule.endDate,
          request.id, // exclude current request's schedule
        );

        if (hasOverlap) {
          throw new BadRequestException(
            `Cannot approve request. There is already an active schedule for teacher ID ${request.schedule.teacherId} in the requested period.`,
          );
        }
      }

      // Update request status
      const updatedRequest = await this.store({
        ...request,
        status: RequestStatus.APPROVED,
        approverId: userId,
      });

      // Update schedule status using the service
      if (request.schedule) {
        await this.scheduleService.updateById(request.schedule.id, {
          status: UserStatus.ACTIVE,
        });
      }

      return updatedRequest;
    } else if (action === RequestAction.CANCEL) {
      if (request.status !== RequestStatus.APPROVED) {
        throw new BadRequestException('Only approved requests can be canceled');
      }

      // Update request status
      const updatedRequest = await this.store({
        ...request,
        status: RequestStatus.CANCELED,
      });

      // Update schedule status using the service
      if (request.schedule) {
        await this.scheduleService.updateById(request.schedule.id, {
          status: UserStatus.BLOCKED,
        });
      }

      return updatedRequest;
    }

    throw new BadRequestException(
      `Invalid action: ${action}. Must be one of: ${Object.values(
        RequestAction,
      ).join(', ')}`,
    );
  }

  async createBusySchedule(
    createScheduleDto: CreateBusySchedulesRequestDto,
    userId: string,
    role: RoleName,
  ) {
    // Determine initial status based on role
    const isAdmin = role === RoleName.ADMIN;
    const status = isAdmin ? RequestStatus.APPROVED : RequestStatus.PENDING;
    const scheduleStatus = isAdmin;

    // Create request first
    const request = await this.store({
      name: createScheduleDto.name,
      description: createScheduleDto.description,
      creatorId: userId,
      requesterId: isAdmin ? null : userId,
      type: RequestType.BUSY_SCHEDULE,
      status: status,
    });

    // Create schedule using the service
    const schedule = await this.scheduleService.store({
      name: createScheduleDto.name,
      description: createScheduleDto.description,
      type: ScheduleType.BUSY,
      startDate: createScheduleDto.startDate,
      endDate: createScheduleDto.endDate,
      teacherId: isAdmin ? null : userId,
      requestId: request.id,
      status: scheduleStatus,
    });

    return { request, schedule };
  }

  async getBusyScheduleById(id: string) {
    const request = await this.findOne({
      where: { id, type: RequestType.BUSY_SCHEDULE },
      relations: ['schedule', 'creator', 'requester', 'approver'],
    });

    if (!request) {
      throw new NotFoundException('Busy schedule request not found');
    }

    return request;
  }

  async updateBusySchedule(
    id: string,
    updateData: UpdateBusySchedulesRequestDto,
  ) {
    const request = await this.findOne({
      where: { id, type: RequestType.BUSY_SCHEDULE },
      relations: ['schedule'],
    });

    if (!request) {
      throw new NotFoundException('Busy schedule request not found');
    }

    // Only allow updates for PENDING requests
    if (request.status !== RequestStatus.PENDING) {
      throw new BadRequestException('Only pending requests can be updated');
    }

    // Update request
    const updatedRequest = await this.store({
      ...request,
      name: updateData.name,
      description: updateData.description,
    });

    // Update schedule using the service
    if (request.schedule) {
      await this.scheduleService.updateById(request.schedule.id, {
        name: updateData.name,
        description: updateData.description,
        startDate: updateData.startDate,
        endDate: updateData.endDate,
      });
    }

    return updatedRequest;
  }

  async updateBusyScheduleStatus(
    id: string,
    action: RequestAction,
    userId?: string,
  ) {
    const request = await this.findOne({
      where: { id, type: RequestType.BUSY_SCHEDULE },
      relations: ['schedule'],
    });

    if (!request) {
      throw new NotFoundException('Busy schedule request not found');
    }

    if (action === RequestAction.APPROVE) {
      if (request.status !== RequestStatus.PENDING) {
        throw new BadRequestException('Only pending requests can be approved');
      }

      if (!userId) {
        throw new BadRequestException('User ID is required for approval');
      }

      // Check for overlapping schedules if needed
      if (request.schedule && request.schedule.teacherId) {
        const hasOverlap = await this.scheduleService.checkOverlappingSchedules(
          request.schedule.teacherId,
          request.schedule.startDate,
          request.schedule.endDate,
          request.id, // exclude current request's schedule
        );

        if (hasOverlap) {
          throw new BadRequestException(
            `Cannot approve request. There is already an active schedule for teacher ID ${request.schedule.teacherId} in the requested period.`,
          );
        }
      }

      // Update request status
      const updatedRequest = await this.store({
        ...request,
        status: RequestStatus.APPROVED,
        approverId: userId,
      });

      // Update schedule status using the service
      if (request.schedule) {
        await this.scheduleService.updateById(request.schedule.id, {
          status: UserStatus.ACTIVE,
        });
      }

      return updatedRequest;
    } else if (action === RequestAction.CANCEL) {
      if (request.status !== RequestStatus.APPROVED) {
        throw new BadRequestException('Only approved requests can be canceled');
      }

      // Update request status
      const updatedRequest = await this.store({
        ...request,
        status: RequestStatus.CANCELED,
      });

      // Update schedule status using the service
      if (request.schedule) {
        await this.scheduleService.updateById(request.schedule.id, {
          status: UserStatus.BLOCKED,
        });
      }

      return updatedRequest;
    }

    throw new BadRequestException(
      `Invalid action: ${action}. Must be one of: ${Object.values(
        RequestAction,
      ).join(', ')}`,
    );
  }
}
