import {
  ClassEntity,
  CounterType,
  CreateClassDto,
  QueryClassDto,
  RoleName,
  ScheduleEntity,
  ScheduleType,
  StudentClassEntity,
  UpdateClassDto,
  UserEntity,
  UserStatus,
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

@Injectable()
export class ClassService extends BaseService<ClassEntity> {
  constructor(
    @InjectRepository(ClassEntity)
    private readonly classRepository: Repository<ClassEntity>,
    private readonly counterService: CounterService,
    @InjectRepository(ScheduleEntity)
    private readonly scheduleRepository: Repository<ScheduleEntity>,
    @InjectRepository(StudentClassEntity)
    private readonly studentClassRepository: Repository<StudentClassEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {
    super(classRepository);
  }

  async findById(id: string): Promise<ClassEntity> {
    const classEntity = await this.findOne({
      where: { id },
      relations: ['course', 'teacher', 'room'],
    });

    if (!classEntity) {
      throw new NotFoundException('Class not found');
    }

    return classEntity;
  }

  async findByCode(code: string): Promise<ClassEntity | null> {
    const classEntity = await this.classRepository.findOne({ where: { code } });
    return classEntity;
  }

  async create(createClassDto: CreateClassDto): Promise<ClassEntity> {
    if (createClassDto.code) {
      const existingClass = await this.findByCode(createClassDto.code);
      if (existingClass) {
        throw new BadRequestException('Class with this code already exists');
      }
    } else {
      createClassDto.code = await this.counterService.getNextCode(
        CounterType.LH,
      );
    }

    return this.store(createClassDto);
  }

  async updateById(
    id: string,
    updateClassDto: UpdateClassDto,
  ): Promise<ClassEntity> {
    const classEntity = await this.findById(id);

    // Don't allow code to be changed if specified
    if (updateClassDto.code && updateClassDto.code !== classEntity.code) {
      const existingClass = await this.findByCode(updateClassDto.code);
      if (existingClass && existingClass.id !== id) {
        throw new BadRequestException('Class with this code already exists');
      }
    }

    return this.store({
      ...classEntity,
      ...updateClassDto,
    });
  }

  async deleteById(id: string): Promise<ClassEntity> {
    const classEntity = await this.findById(id);

    await this.delete(id);

    return classEntity;
  }

  async findStudentsByClassId(
    query: Record<string, any>,
    classId: string,
  ): Promise<{
    page: number;
    limit: number;
    total: number;
    data: UserEntity[];
  }> {
    const { page = 1, limit = 10, sort = 'createdAt:desc', search } = query;

    const classEntity = await this.findOne({
      where: { id: classId },
    });

    if (!classEntity) {
      throw new NotFoundException('Class not found');
    }

    // Fetch student IDs from student-class relationship
    const studentClasses = await this.studentClassRepository.find({
      where: { classId, status: UserStatus.ACTIVE },
    });

    const studentIds = studentClasses.map((sc) => sc.studentId);

    if (studentIds.length === 0) {
      return { page, limit, total: 0, data: [] };
    }

    const queryBuilder = this.userRepository
      .createQueryBuilder('entity')
      .innerJoinAndSelect('entity.role', 'role')
      .innerJoinAndSelect('entity.detail', 'detail')
      .where('entity.id IN (:...studentIds)', { studentIds });

    if (search) {
      queryBuilder.andWhere(
        '(entity.fullName ILIKE :search OR entity.email ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const metadata = this.userRepository.metadata;
    queryBuilder.skip((page - 1) * limit);
    queryBuilder.take(limit);

    const [sortColumn, sortOrder] = sort.split(':');
    if (this.columnExists(sortColumn, metadata)) {
      queryBuilder.orderBy(
        `entity.${sortColumn}`,
        sortOrder.toUpperCase() as 'ASC' | 'DESC',
      );
    }

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      page,
      limit,
      total,
      data,
    };
  }

  async getSchedules(classId: string) {
    const classEntity = await this.findById(classId);

    return this.scheduleRepository.find({
      where: [
        {
          classId,
          status: UserStatus.ACTIVE,
          type: ScheduleType.TEACHING,
        },
        {
          teacherId: classEntity.teacherId,
          status: UserStatus.ACTIVE,
          type: ScheduleType.BUSY,
        },
      ],
    });
  }

  async queryMyClasses(
    getClassDto: QueryClassDto,
    userId: string,
    role: RoleName,
  ) {
    const {
      page = 1,
      limit = 10,
      sort = 'createdAt:desc',
      ...filter
    } = getClassDto;

    const queryBuilder = this.classRepository
      .createQueryBuilder('entity')
      .leftJoinAndSelect('entity.course', 'course')
      .leftJoinAndSelect('entity.room', 'room')
      .leftJoinAndSelect('entity.teacher', 'teacher')
      .leftJoinAndSelect('entity.studentClasses', 'studentClasses');

    if (
      [RoleName.TEACHER_FULL_TIME, RoleName.TEACHER_PART_TIME].includes(role)
    ) {
      queryBuilder.andWhere('entity.teacherId = :userId', { userId });
    } else if (role === RoleName.STUDENT) {
      queryBuilder.andWhere('studentClasses.studentId = :userId', { userId });
    }

    const metadata = this.repository.metadata;
    this.applyFiltering(queryBuilder, filter, metadata);
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

  async addStudentToClass(classId: string, studentId: string): Promise<void> {
    const classEntity = await this.findById(classId);

    const student = await this.userRepository.findOne({
      where: { id: studentId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Check if the student is already in the class
    const existingRelation = await this.studentClassRepository.findOne({
      where: {
        classId,
        studentId,
      },
    });

    if (existingRelation) {
      throw new BadRequestException('Student is already in this class');
    }

    // Create relationship
    const studentClass = this.studentClassRepository.create({
      classId,
      studentId,
      status: UserStatus.ACTIVE,
    });

    await this.studentClassRepository.save(studentClass);
  }

  async removeStudentFromClass(
    classId: string,
    studentId: string,
  ): Promise<void> {
    const classEntity = await this.findById(classId);

    const student = await this.userRepository.findOne({
      where: { id: studentId },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Check if the student is in the class
    const existingRelation = await this.studentClassRepository.findOne({
      where: {
        classId,
        studentId,
      },
    });

    if (!existingRelation) {
      throw new BadRequestException('Student is not in this class');
    }

    await this.studentClassRepository.remove(existingRelation);
  }
}
