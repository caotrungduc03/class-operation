import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { UserStatus } from '../enums';
import { CourseEntity } from './course.entity';
import { CustomBaseEntity } from './customBase.entity';
import { RoomEntity } from './room.entity';
import { ScheduleEntity } from './schedule.entity';
import { StudentClassEntity } from './student-class.entity';
import { SupportTicketEntity } from './support-ticket.entity';
import { UserEntity } from './user.entity';

@Entity({ name: 'classes' })
export class ClassEntity extends CustomBaseEntity {
  @Column({
    unique: true,
  })
  code: string;

  @Column()
  name: string;

  @Column({
    nullable: true,
  })
  description: string;

  @Column({
    name: 'start_date',
    type: 'timestamptz',
    nullable: true,
  })
  startDate: Date;

  @Column({
    name: 'end_date',
    type: 'timestamptz',
    nullable: true,
  })
  endDate: Date;

  @Column({
    type: 'integer',
    default: 0,
  })
  quantity: number;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @Column({
    name: 'course_id',
  })
  courseId: string;

  @ManyToOne(() => CourseEntity, (course: CourseEntity) => course.classes)
  @JoinColumn({
    name: 'course_id',
  })
  course: CourseEntity;

  @Column({
    name: 'teacher_id',
    nullable: true,
  })
  teacherId: string;

  @ManyToOne(() => UserEntity, (user: UserEntity) => user.teachers)
  @JoinColumn({
    name: 'teacher_id',
  })
  teacher: UserEntity;

  @OneToMany(
    () => StudentClassEntity,
    (studentClass: StudentClassEntity) => studentClass.class,
  )
  studentClasses: StudentClassEntity[];

  @Column({
    name: 'room_id',
    nullable: true,
  })
  roomId: string;

  @ManyToOne(() => RoomEntity, (room: RoomEntity) => room.classes, {
    nullable: true,
  })
  @JoinColumn({
    name: 'room_id',
  })
  room: RoomEntity;

  @OneToMany(() => ScheduleEntity, (schedule: ScheduleEntity) => schedule.class)
  schedules: ScheduleEntity[];

  @OneToMany(
    () => SupportTicketEntity,
    (supportTicket: SupportTicketEntity) => supportTicket.class,
  )
  supportTickets: SupportTicketEntity[];
}
