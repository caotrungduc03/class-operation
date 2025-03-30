import { CustomBaseEntity } from '@co/common';
import { ROLE_NAME } from '@co/constants';
import { RoleName } from '@co/types';
import { Column, Entity, OneToMany } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity({
  name: 'roles',
})
export class RoleEntity extends CustomBaseEntity {
  @Column({
    name: 'role_name',
    type: 'enum',
    enum: ROLE_NAME,
  })
  roleName: RoleName;

  @OneToMany(() => UserEntity, (user: UserEntity) => user.role)
  users: UserEntity[];
}
