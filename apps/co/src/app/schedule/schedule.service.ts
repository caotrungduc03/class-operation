import {
  CreateTeachingSchedulesDto,
  GetScheduleDto,
  RoleName,
  ScheduleEntity,
  ScheduleType,
  UserStatus,
} from '@class-operation/libs';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, FindOptionsWhere, ILike, Repository } from 'typeorm';
import { BaseService } from '../../common';
import { ClassService } from '../class/class.service';

@Injectable()
export class ScheduleService extends BaseService<ScheduleEntity> {
  constructor(
    @InjectRepository(ScheduleEntity)
    private readonly scheduleRepository: Repository<ScheduleEntity>,
    private readonly classService: ClassService,
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
    if (
      [RoleName.TEACHER_FULL_TIME, RoleName.TEACHER_PART_TIME].includes(role)
    ) {
      query.teacherId = userId;
    }

    const { startDate, endDate, teacherId, name, type } = query;

    // Build query conditions
    const conditions: FindOptionsWhere<ScheduleEntity> = {
      startDate: Between(new Date(startDate), new Date(endDate)),
      endDate: Between(new Date(startDate), new Date(endDate)),
      status: UserStatus.ACTIVE,
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
      .andWhere('schedule.status = :status', {
        status: UserStatus.ACTIVE,
      })
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

  async createTeachingSchedules(createDto: CreateTeachingSchedulesDto) {
    const { classId, name, description, startDate, endDate } = createDto;

    // Find the class
    const classEntity = await this.classService.findById(classId);

    // Use provided teacherId if available, otherwise use the class's teacher
    const teacherId = classEntity.teacherId;

    // Validate teacher exists
    if (!teacherId) {
      throw new BadRequestException(
        'Teacher ID must be provided or the class must have an assigned teacher',
      );
    }

    // Check for overlapping schedules
    const hasOverlap = await this.checkOverlappingSchedules(
      teacherId,
      new Date(startDate),
      new Date(endDate),
    );

    console.log('hasOverlap', hasOverlap);

    if (hasOverlap) {
      throw new BadRequestException(
        'Schedule overlaps with existing schedules for this teacher',
      );
    }

    const savedSchedule = await this.store({
      name,
      description,
      startDate,
      endDate,
      teacherId,
      classId,
      type: ScheduleType.TEACHING,
    });

    console.log('savedSchedule', savedSchedule);

    return savedSchedule;
  }
}
