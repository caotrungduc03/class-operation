import { Column, Entity, OneToMany } from 'typeorm';
import { CourseType } from '../enums/course.enum';
import { ClassEntity } from './class.entity';
import { CustomBaseEntity } from './customBase.entity';

@Entity({ name: 'courses' })
export class CourseEntity extends CustomBaseEntity {
  @Column()
  name: string;

  @Column({
    nullable: true,
  })
  description: string;

  @Column({
    default: false,
  })
  status: boolean;

  @Column({
    type: 'enum',
    enum: CourseType,
  })
  type: CourseType;

  @OneToMany(
    () => ClassEntity,
    (classEntity: ClassEntity) => classEntity.course,
  )
  classes: ClassEntity[];
}
