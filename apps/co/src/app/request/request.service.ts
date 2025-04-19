import {
  CreateRequestWeeklyNormDto,
  RequestAction,
  RequestEntity,
  RequestStatus,
  RequestType,
  RoleName,
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
import { WeeklyNormService } from '../weekly-norm/weekly-norm.service';

@Injectable()
export class RequestService extends BaseService<RequestEntity> {
  constructor(
    @InjectRepository(RequestEntity)
    private readonly requestRepository: Repository<RequestEntity>,
    private readonly weeklyNormService: WeeklyNormService,
  ) {
    super(requestRepository);
  }

  async createWeeklyNorms(
    createRequestDto: CreateRequestWeeklyNormDto,
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
      case RoleName.TEACHER:
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
    updateData: CreateRequestWeeklyNormDto,
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
    const weeklyNorms = updateData.weeklyNorms.map((norm) => {
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
}
