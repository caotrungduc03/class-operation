import { Column, Entity } from 'typeorm';
import { CounterType } from '../enums';
import { CustomBaseEntity } from './customBase.entity';

@Entity({ name: 'counters' })
export class CounterEntity extends CustomBaseEntity {
  @Column({
    unique: true,
    type: 'enum',
    enum: CounterType,
  })
  type: CounterType;

  @Column({
    default: 0,
  })
  count: number;
}
