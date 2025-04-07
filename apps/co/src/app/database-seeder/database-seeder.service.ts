import {
  encodePassword,
  RoleEntity,
  RoleName,
  UserEntity,
} from '@class-operation/libs';
import { Injectable } from '@nestjs/common';
import { RoleService } from '../role/role.service';
import { UserService } from '../user/user.service';

@Injectable()
export class DatabaseSeederService {
  constructor(
    private readonly roleService: RoleService,
    private readonly userService: UserService,
  ) {}

  async seed() {
    await this.seedRoles();
    await this.seedUsers();
  }

  private async seedRoles() {
    const roles: RoleEntity[] = [];
    for (const roleName of Object.values(RoleName)) {
      const existingRole = await this.roleService.findByName(roleName);
      if (!existingRole) {
        const role = new RoleEntity();
        role.roleName = roleName;
        roles.push(role);
      }
    }

    await this.roleService.store(roles);
  }

  private async seedUsers() {
    const existingAdmin = await this.userService.findOne({
      where: { email: process.env.ADMIN_EMAIL },
    });

    if (!existingAdmin) {
      const user = new UserEntity();
      user.email = process.env.ADMIN_EMAIL || '';
      user.password = encodePassword(process.env.ADMIN_PASSWORD || '');
      user.firstName = process.env.ADMIN_FIRST_NAME || '';
      user.lastName = process.env.ADMIN_LAST_NAME || '';
      const role = await this.roleService.findByName(RoleName.ADMIN);
      if (!role) {
        throw new Error('Admin role not found');
      }
      user.role = role;

      await this.userService.store(user);
    }
  }
}
