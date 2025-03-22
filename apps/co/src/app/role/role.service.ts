import { BaseService } from '@co/common';
import { ROLE_NAME } from '@co/constants';
import { CreateRoleDto, UpdateRoleDto } from '@co/dtos';
import { RoleEntity } from '@co/entities';
import { RoleName } from '@co/types';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class RoleService extends BaseService<RoleEntity> {
  constructor(
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>
  ) {
    super(roleRepository);
  }

  async findById(id: string): Promise<RoleEntity> {
    const role = await this.findOne({ where: { id } });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return role;
  }

  async create(createRoleDto: CreateRoleDto): Promise<RoleEntity> {
    const role = await this.findByName(createRoleDto.roleName);
    if (role) {
      throw new BadRequestException('Role already exists');
    }

    return this.store(createRoleDto);
  }

  async updateById(
    id: string,
    updateRoleDto: UpdateRoleDto
  ): Promise<RoleEntity> {
    const role = await this.findById(id);
    if (Object.keys(ROLE_NAME).includes(role.roleName)) {
      throw new BadRequestException('You cannot update this role');
    }

    return this.store({
      ...role,
      ...updateRoleDto,
    });
  }

  async deleteById(id: string): Promise<RoleEntity> {
    const role = await this.findById(id);
    if (Object.keys(ROLE_NAME).includes(role.roleName)) {
      throw new BadRequestException('You cannot delete this role');
    }

    await this.delete(id);

    return role;
  }

  async findByName(roleName: RoleName): Promise<RoleEntity> {
    const role = await this.findOne({ where: { roleName } });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return role;
  }
}
