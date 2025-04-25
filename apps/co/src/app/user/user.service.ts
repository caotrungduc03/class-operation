import {
  CreateUserDto,
  encodePassword,
  FindOptions,
  ROLE_COUNTER_TYPE,
  RoleName,
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
import { CounterService } from '../counter/counter.service';
import { RoleService } from '../role/role.service';
import { UserDetailService } from '../user-detail/user-detail.service';

@Injectable()
export class UserService extends BaseService<UserEntity> {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly roleService: RoleService,
    private readonly counterService: CounterService,
    private readonly userDetailService: UserDetailService,
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
      relations: ['role', 'detail'],
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
      ],
    });
  }

  async create(createUserDto: CreateUserDto): Promise<UserEntity> {
    if (createUserDto.password !== createUserDto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const lowerCaseEmail = createUserDto.email.toLowerCase();
    const user = await this.findOne({
      where: {
        email: lowerCaseEmail,
      },
    });
    if (user) {
      throw new BadRequestException('User already exists');
    }

    const role = await this.roleService.findByName(createUserDto.roleName);
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    const code = await this.counterService.getNextCode(
      ROLE_COUNTER_TYPE[role.roleName],
    );
    const userDetail = await this.userDetailService.createUserDetail(code);

    const encodedPassword = encodePassword(createUserDto.password);

    return this.store({
      ...createUserDto,
      password: encodedPassword,
      role,
      detail: userDetail,
    });
  }

  async findUsersByRoleName(roleName: RoleName, query: Record<string, any>) {
    const { page = 1, limit = 10, sort = 'id:desc', search } = query;

    const queryBuilder = this.repository
      .createQueryBuilder('entity')
      .innerJoinAndSelect('entity.role', 'role')
      .innerJoinAndSelect('entity.detail', 'detail')
      .where('role.roleName = :roleName', { roleName });

    if (search) {
      queryBuilder.andWhere(
        '(entity.firstName ILIKE :search OR entity.lastName ILIKE :search OR entity.email ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const metadata = this.repository.metadata;
    this.applyPagination(queryBuilder, page, limit);
    this.applySorting(queryBuilder, sort, metadata);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      page,
      limit,
      total,
      data,
    };
  }
}
