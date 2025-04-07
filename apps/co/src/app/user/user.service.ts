import {
  CreateUserDto,
  encodePassword,
  FindOptions,
  UserEntity,
} from '@class-operation/libs';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseService } from '../../common';
import { RoleService } from '../role/role.service';

@Injectable()
export class UserService extends BaseService<UserEntity> {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly roleService: RoleService,
  ) {
    super(userRepository);
  }

  async findById(id: string, options?: FindOptions): Promise<UserEntity> {
    if (!id) {
      throw new BadRequestException('UserId is required');
    }

    const { relations = [] } = options || {};

    const user = await this.findOne({
      where: { id },
      relations,
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    if (!email) {
      throw new BadRequestException('Email is required');
    }

    return this.userRepository.findOne({
      where: { email },
      relations: ['role'],
      select: [
        'id',
        'email',
        'password',
        'firstName',
        'lastName',
        'phoneNumber',
        'avatar',
        'status',
        'lastLogin',
        'roleId',
      ],
    });
  }

  async create(createUserDto: CreateUserDto): Promise<UserEntity> {
    if (createUserDto.password !== createUserDto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const newUser = new UserEntity();
    newUser.email = createUserDto.email.toLowerCase();
    const user = await this.findOne({
      where: {
        email: newUser.email,
      },
    });
    if (user) {
      throw new BadRequestException('User already exists');
    }

    const role = await this.roleService.findById(createUserDto.roleId);
    if (!role) {
      throw new BadRequestException('Role not found');
    }

    newUser.password = encodePassword(createUserDto.password);
    newUser.role = role;

    return this.store({
      ...createUserDto,
      ...newUser,
    });
  }
}
