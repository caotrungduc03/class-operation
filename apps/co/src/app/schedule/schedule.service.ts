import {
  GetScheduleDto,
  RoleName,
  ScheduleEntity,
} from '@class-operation/libs';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { BaseService } from '../../common';

@Injectable()
export class ScheduleService extends BaseService<ScheduleEntity> {
  constructor(
    @InjectRepository(ScheduleEntity)
    private readonly scheduleRepository: Repository<ScheduleEntity>,
  ) {
    super(scheduleRepository);
  }

  async findById(id: string): Promise<ScheduleEntity> {
    const schedule = await this.findOne({
      where: { id },
      relations: ['request'],
    });

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    return schedule;
  }

  async updateById(
    id: string,
    updateData: Partial<ScheduleEntity>,
  ): Promise<ScheduleEntity> {
    const schedule = await this.findById(id);

    const updatedSchedule = await this.store({
      ...schedule,
      ...updateData,
    });

    return updatedSchedule;
  }

  async cancelById(id: string): Promise<ScheduleEntity> {
    const schedule = await this.findById(id);

    const canceledSchedule = await this.store({
      ...schedule,
      status: false,
    });

    return canceledSchedule;
  }

  async updateMany(
    ids: string[],
    updateData: Partial<ScheduleEntity>,
  ): Promise<void> {
    await this.scheduleRepository
      .createQueryBuilder()
      .update(ScheduleEntity)
      .set(updateData)
      .whereInIds(ids)
      .execute();
  }

  async findByRangeDate(query: GetScheduleDto, userId: string, role: RoleName) {
    switch (role) {
      case RoleName.ADMIN:
        break;
      case RoleName.TEACHER:
        query.teacherId = userId;
        break;
    }

    const { startDate, endDate, teacherId } = query;
    if (!teacherId) {
      throw new NotFoundException('Teacher ID is required');
    }

    return this.scheduleRepository.find({
      where: {
        teacherId,
        startDate: Between(new Date(startDate), new Date(endDate)),
        endDate: Between(new Date(startDate), new Date(endDate)),
        status: true,
      },
      order: {
        startDate: 'ASC',
      },
    });
  }

  async checkOverlappingSchedules(
    teacherId: string,
    startDate: Date,
    endDate: Date,
    excludeRequestId?: string,
  ): Promise<boolean> {
    const query = this.scheduleRepository
      .createQueryBuilder('schedule')
      .where('schedule.teacherId = :teacherId', { teacherId })
      .andWhere('schedule.status = TRUE')
      .andWhere(
        '(schedule.startDate <= :endDate AND schedule.endDate >= :startDate)',
        { startDate, endDate },
      );

    if (excludeRequestId) {
      query.andWhere('schedule.requestId != :requestId', {
        requestId: excludeRequestId,
      });
    }

    const overlappingSchedules = await query.getCount();
    return overlappingSchedules > 0;
  }

  async deleteByRequestId(requestId: string): Promise<void> {
    await this.scheduleRepository.delete({ requestId });
  }
}
