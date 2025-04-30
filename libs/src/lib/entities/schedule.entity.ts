import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { UserStatus } from '../enums';
import { ScheduleType } from '../enums/schedule.enum';
import { ClassEntity } from './class.entity';
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

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

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

  @Column({
    name: 'class_id',
    nullable: true,
  })
  classId: string;

  @ManyToOne(
    () => ClassEntity,
    (classEntity: ClassEntity) => classEntity.schedules,
  )
  @JoinColumn({
    name: 'class_id',
  })
  class: ClassEntity;
}
