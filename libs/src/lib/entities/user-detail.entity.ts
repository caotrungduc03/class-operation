import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { TeacherLevel } from '../enums';
import { CustomBaseEntity } from './customBase.entity';
import { DepartmentEntity } from './department.entity';
import { FieldEntity } from './field.entity';
import { UserEntity } from './user.entity';

@Entity({ name: 'users_detail' })
export class UserDetail extends CustomBaseEntity {
  @Column({
    name: 'code',
    unique: true,
  })
  code: string;

  @Column({
    name: 'teacher_level',
    type: 'enum',
    enum: TeacherLevel,
    nullable: true,
  })
  teacherLevel: TeacherLevel;

  @Column({ name: 'department_id', nullable: true })
  departmentId: string;

  @ManyToOne(
    () => DepartmentEntity,
    (department: DepartmentEntity) => department.users,
  )
  @JoinColumn({ name: 'department_id' })
  department: DepartmentEntity;

  @Column({ name: 'field_id', nullable: true })
  fieldId: string;

  @ManyToOne(() => FieldEntity, (field: FieldEntity) => field.teachers)
  @JoinColumn({ name: 'field_id' })
  field: FieldEntity;

  @OneToOne(() => UserEntity, (user) => user.detail)
  user: UserEntity;
}
