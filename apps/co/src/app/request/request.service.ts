import {
  CreateRequestWeeklyNormDto,
  RequestEntity,
  RequestStatus,
  RequestType,
  RoleName,
} from '@class-operation/libs';
import { Injectable, NotFoundException } from '@nestjs/common';
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

    // Get existing weekly norms to delete
    const existingNormIds = request.weeklyNorms.map((norm) => norm.id);

    // Delete existing weekly norms
    if (existingNormIds.length > 0) {
      await Promise.all(
        existingNormIds.map((id) => this.weeklyNormService.delete(id)),
      );
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

    await this.weeklyNormService.store(weeklyNorms);

    return updatedRequest;
  }

  async cancelWeeklyNorm(id: string) {
    // Find the request to cancel
    const request = await this.findOne({
      where: { id, type: RequestType.WEEKLY_NORM },
      relations: ['weeklyNorms'],
    });

    if (!request) {
      throw new NotFoundException('Weekly norm request not found');
    }

    // Only allow cancellation for APPROVED requests
    if (request.status !== RequestStatus.APPROVED) {
      throw new Error('Only approved requests can be canceled');
    }

    // Update request status
    const canceledRequest = await this.store({
      ...request,
      status: RequestStatus.CANCELED,
    });

    // Update all weekly norms to inactive
    if (request.weeklyNorms.length > 0) {
      await Promise.all(
        request.weeklyNorms.map((norm) =>
          this.weeklyNormService.update(norm.id, { status: false }),
        ),
      );
    }

    return canceledRequest;
  }
}
