import {
  CounterEntity,
  ROLE_COUNTER_TYPE_MAP,
  RoleName,
} from '@class-operation/libs';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '../../common';

@Injectable()
export class CounterService extends BaseService<CounterEntity> {
  constructor(
    @InjectRepository(CounterEntity)
    private readonly counterRepository: Repository<CounterEntity>,
  ) {
    super(counterRepository);
  }

  async getNextCode(roleName: RoleName): Promise<string> {
    const counterType = ROLE_COUNTER_TYPE_MAP[roleName];

    if (!counterType) {
      throw new InternalServerErrorException(
        `No counter type defined for role ${roleName}`,
      );
    }

    const counter = await this.findOne({
      where: {
        type: counterType,
      },
    });

    if (!counter) {
      throw new InternalServerErrorException(
        `Counter not found for role ${roleName}`,
      );
    }

    counter.count += 1;
    await this.store(counter);

    return `${counter.type}${counter.count.toString().padStart(4, '0')}`;
  }
}
