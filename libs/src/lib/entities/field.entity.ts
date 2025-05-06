import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { CustomBaseEntity } from './customBase.entity';
import { UserDetail } from './user-detail.entity';
import { UserEntity } from './user.entity';

@Entity({ name: 'fields' })
export class FieldEntity extends CustomBaseEntity {
  @Column({ unique: true })
  code: string;

  @Column()
  name: string;

  @Column({
    nullable: true,
  })
  description: string;

  @Column({ name: 'leader_id', nullable: true })
  leaderId: string;

  @OneToOne(() => UserEntity)
  @JoinColumn({ name: 'leader_id' })
  leader: UserEntity;

  @OneToMany(() => UserDetail, (userDetail: UserDetail) => userDetail.field)
  teachers: UserDetail[];
}
