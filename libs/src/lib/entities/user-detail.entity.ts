import { Column, Entity, OneToOne } from 'typeorm';
import { CustomBaseEntity } from './customBase.entity';
import { UserEntity } from './user.entity';

@Entity({ name: 'users_detail' })
export class UserDetail extends CustomBaseEntity {
  @Column({
    name: 'code',
  })
  code: string;

  @OneToOne(() => UserEntity, (user) => user.detail)
  user: UserEntity;
}
