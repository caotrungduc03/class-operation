import { Column, Entity, ManyToOne } from 'typeorm';
import { CustomBaseEntity } from './customBase.entity';
import { UserEntity } from './user.entity';

@Entity({
  name: 'notifications',
})
export class NotificationEntity extends CustomBaseEntity {
  @Column({
    name: 'user_id',
  })
  userId: string;

  @Column()
  title: string;

  @Column({
    default: false,
  })
  read: boolean;

  @Column({
    type: 'text',
    nullable: true,
  })
  content?: string;

  @ManyToOne(() => UserEntity, (user) => user.notifications)
  user: UserEntity;
}
