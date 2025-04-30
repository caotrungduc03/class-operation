import {
  ClassEntity,
  CounterType,
  CreateClassDto,
  UpdateClassDto,
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

@Injectable()
export class ClassService extends BaseService<ClassEntity> {
  constructor(
    @InjectRepository(ClassEntity)
    private readonly classRepository: Repository<ClassEntity>,
    private readonly counterService: CounterService,
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

  async findStudentsByClassId(classId: string): Promise<UserEntity[]> {
    const classEntity = await this.findOne({
      where: { id: classId },
      relations: ['studentClasses', 'studentClasses.student'],
    });

    if (!classEntity) {
      throw new NotFoundException('Class not found');
    }

    // Extract students from the student-class relationship
    const students = classEntity.studentClasses.map((sc) => sc.student);
    return students;
  }
}
