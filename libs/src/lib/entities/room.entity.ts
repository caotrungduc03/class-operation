import { Column, Entity, OneToMany } from 'typeorm';
import { ClassEntity } from './class.entity';
import { CustomBaseEntity } from './customBase.entity';

@Entity({ name: 'rooms' })
export class RoomEntity extends CustomBaseEntity {
  @Column({
    unique: true,
  })
  code: string;

  @Column()
  name: string;

  @Column({
    nullable: true,
  })
  quantity: number;

  @Column({
    nullable: true,
  })
  location: string;

  @Column({
    nullable: true,
  })
  description: string;

  @Column({
    default: true,
  })
  status: boolean;

  @OneToMany(() => ClassEntity, (classEntity: ClassEntity) => classEntity.room)
  classes: ClassEntity[];
}
