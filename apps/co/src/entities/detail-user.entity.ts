import { CustomBaseEntity } from '@co/common';
import { Column, Entity, OneToOne } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity({ name: 'detail_users' })
export class DetailUser extends CustomBaseEntity {
  @Column({
    name: 'code',
  })
  code: string;

  @OneToOne(() => UserEntity, (user) => user.teacherDetail)
  user: UserEntity;
}
