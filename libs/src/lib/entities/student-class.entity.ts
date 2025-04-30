import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { UserStatus } from '../enums';
import { ClassEntity } from './class.entity';
import { CustomBaseEntity } from './customBase.entity';
import { UserEntity } from './user.entity';

@Entity({ name: 'student_class' })
export class StudentClassEntity extends CustomBaseEntity {
  @Column({ name: 'class_id' })
  classId: string;

  @Column({ name: 'student_id' })
  studentId: string;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @ManyToOne(
    () => ClassEntity,
    (classEntity: ClassEntity) => classEntity.studentClasses,
  )
  @JoinColumn({ name: 'class_id' })
  class: ClassEntity;

  @ManyToOne(() => UserEntity, (user: UserEntity) => user.enrolledClasses)
  @JoinColumn({ name: 'student_id' })
  student: UserEntity;
}
