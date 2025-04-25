import {
  GetScheduleDto,
  RoleName,
  ScheduleEntity,
} from '@class-operation/libs';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, ILike, Repository } from 'typeorm';
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
    // Set teacherId based on role
    if (role === RoleName.TEACHER) {
      query.teacherId = userId;
    }

    const { startDate, endDate, teacherId, name, type } = query;

    // Build query conditions
    const conditions: any = {
      startDate: Between(startDate, endDate),
      endDate: Between(startDate, endDate),
      status: true,
    };

    // Add teacherId condition if provided
    if (teacherId) {
      conditions.teacherId = teacherId;
    }

    // Add name filter if provided (case insensitive partial match)
    if (name) {
      conditions.name = ILike(`%${name}%`);
    }

    // Add type filter if provided
    if (type) {
      conditions.type = type;
    }

    return this.scheduleRepository.find({
      where: conditions,
      relations: ['request'],
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
