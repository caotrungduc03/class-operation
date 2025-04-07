import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { CustomBaseEntity } from './customBase.entity';
import { RoleEntity } from './role.entity';
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
    default: true,
  })
  status: boolean;

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
  detail: RoleEntity;
}
