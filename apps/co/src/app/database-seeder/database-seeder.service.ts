import { ROLE_NAME } from '@co/constants';
import { RoleEntity, UserEntity } from '@co/entities';
import { encodePassword } from '@co/utils';
import { Injectable } from '@nestjs/common';
import { RoleService } from '../role/role.service';
import { UserService } from '../user/user.service';

@Injectable()
export class DatabaseSeederService {
  constructor(
    private readonly roleService: RoleService,
    private readonly userService: UserService
  ) {}

  async seed() {
    await this.seedRoles();
    await this.seedUsers();
  }

  private async seedRoles() {
    const roles: RoleEntity[] = [];
    for (const roleName of Object.values(ROLE_NAME)) {
      const existingRole = await this.roleService.findByName(roleName);
      if (!existingRole) {
        const role = new RoleEntity();
        role.roleName = roleName;
        roles.push(role);
      }
    }

    console.log({ roles });

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
      user.fullName = process.env.ADMIN_FULL_NAME || '';
      user.role = await this.roleService.findByName(ROLE_NAME.ADMIN);

      await this.userService.store(user);
    }
  }
}
