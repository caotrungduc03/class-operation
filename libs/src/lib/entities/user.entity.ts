import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { UserStatus } from '../enums';
import { ClassEntity } from './class.entity';
import { CustomBaseEntity } from './customBase.entity';
import { FieldEntity } from './field.entity';
import { NotificationEntity } from './notification.entity';
import { RoleEntity } from './role.entity';
import { StudentClassEntity } from './student-class.entity';
import { UserDetail } from './user-detail.entity';

@Entity({ name: 'users' })
export class UserEntity extends CustomBaseEntity {
  @Column({
    name: 'first_name',
  })
  firstName: string;

  @Column({
    name: 'last_name',
  })
  lastName: string;

  @Column({
    unique: true,
  })
  email: string;

  @Column({
    select: false,
  })
  password: string;

  @Column({
    name: 'phone_number',
    nullable: true,
  })
  phoneNumber: string;

  @Column({
    nullable: true,
  })
  avatar: string;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @Column({
    name: 'last_login',
    type: 'timestamptz',
    nullable: true,
  })
  lastLogin: Date;

  @Column({
    name: 'role_id',
  })
  roleId: string;

  @ManyToOne(() => RoleEntity, (role: RoleEntity) => role.users)
  @JoinColumn({
    name: 'role_id',
  })
  role: RoleEntity;

  @Column({
    name: 'detail_user_id',
    nullable: true,
  })
  detailUserId: string;

  @OneToOne(() => UserDetail, (detailUser: UserDetail) => detailUser.user)
  @JoinColumn({
    name: 'detail_user_id',
  })
  detail: UserDetail;

  @OneToMany(
    () => ClassEntity,
    (classEntity: ClassEntity) => classEntity.teacher,
  )
  teachers: ClassEntity[];

  @OneToMany(
    () => StudentClassEntity,
    (studentClass: StudentClassEntity) => studentClass.student,
  )
  students: StudentClassEntity[];

  @OneToMany(() => NotificationEntity, (notification) => notification.user)
  notifications: NotificationEntity[];

  @OneToOne(() => FieldEntity, (field) => field.leader)
  leaderOfField: FieldEntity;
}
