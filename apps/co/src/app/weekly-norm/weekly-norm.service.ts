import { WeeklyNormEntity } from '@class-operation/libs';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '../../common';

@Injectable()
export class WeeklyNormService extends BaseService<WeeklyNormEntity> {
  constructor(
    @InjectRepository(WeeklyNormEntity)
    private readonly weeklyNormRepository: Repository<WeeklyNormEntity>,
  ) {
    super(weeklyNormRepository);
  }

  async findById(id: string): Promise<WeeklyNormEntity> {
    const weeklyNorm = await this.findOne({
      where: { id },
      relations: ['request'],
    });

    if (!weeklyNorm) {
      throw new NotFoundException('Weekly norm not found');
    }

    return weeklyNorm;
  }

  async updateById(
    id: string,
    updateData: Partial<WeeklyNormEntity>,
  ): Promise<WeeklyNormEntity> {
    const weeklyNorm = await this.findById(id);

    const updatedWeeklyNorm = await this.store({
      ...weeklyNorm,
      ...updateData,
    });

    return updatedWeeklyNorm;
  }

  async cancelById(id: string): Promise<WeeklyNormEntity> {
    const weeklyNorm = await this.findById(id);

    const canceledWeeklyNorm = await this.store({
      ...weeklyNorm,
      status: false,
    });

    return canceledWeeklyNorm;
  }

  async updateMany(
    ids: string[],
    updateData: Partial<WeeklyNormEntity>,
  ): Promise<void> {
    await this.weeklyNormRepository
      .createQueryBuilder()
      .update(WeeklyNormEntity)
      .set(updateData)
      .whereInIds(ids)
      .execute();
  }
}
