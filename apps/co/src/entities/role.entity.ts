import { CustomBaseEntity } from '@co/common';
import { RoleName } from '@co/types';
import { Column, Entity, OneToMany } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity({
  name: 'roles',
})
export class RoleEntity extends CustomBaseEntity {
  @Column({
    name: 'role_name',
    type: 'varchar',
    unique: true,
  })
  roleName: RoleName;

  @OneToMany(() => UserEntity, (user: UserEntity) => user.role)
  users: UserEntity[];
}
