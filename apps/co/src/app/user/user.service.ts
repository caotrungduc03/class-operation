import { BaseService } from '@co/common';
import { RegisterRequestDto } from '@co/dtos';
import { UserEntity } from '@co/entities';
import { FindOptions } from '@co/types';
import { encodePassword } from '@co/utils';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleService } from '../role/role.service';

@Injectable()
export class UserService extends BaseService<UserEntity> {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly roleService: RoleService
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

    return this.findOne({
      where: { email },
      relations: ['role'],
      select: [
        'id',
        'email',
        'password',
        'fullName',
        'phoneNumber',
        'avatar',
        'status',
        'lastLogin',
        'roleId',
      ],
    });
  }

  async create(createUserDto: RegisterRequestDto): Promise<UserEntity> {
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

    newUser.password = encodePassword(createUserDto.password);

    return this.store({
      ...createUserDto,
      ...newUser,
    });
  }
}
