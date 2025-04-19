import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { ScheduleType } from '../enums/schedule.enum';
import { CustomBaseEntity } from './customBase.entity';
import { RequestEntity } from './request.entity';

@Entity({
  name: 'schedules',
})
export class ScheduleEntity extends CustomBaseEntity {
  @Column()
  name: string;

  @Column()
  description: string;

  @Column({
    type: 'enum',
    enum: ScheduleType,
  })
  type: ScheduleType;

  @Column({
    name: 'start_date',
    type: 'timestamptz',
  })
  startDate: Date;

  @Column({
    name: 'end_date',
    type: 'timestamptz',
  })
  endDate: Date;

  @Column()
  status: boolean;

  @Column({
    name: 'request_id',
  })
  requestId: string;

  @OneToOne(() => RequestEntity, (request: RequestEntity) => request.schedule)
  @JoinColumn({
    name: 'request_id',
  })
  request: RequestEntity;

  @Column({
    name: 'teacher_id',
    nullable: true,
  })
  teacherId: string;
}
