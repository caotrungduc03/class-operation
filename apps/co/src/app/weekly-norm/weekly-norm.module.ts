import { WeeklyNormEntity } from '@class-operation/libs';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WeeklyNormController } from './weekly-norm.controller';
import { WeeklyNormService } from './weekly-norm.service';

@Module({
  imports: [TypeOrmModule.forFeature([WeeklyNormEntity])],
  controllers: [WeeklyNormController],
  providers: [WeeklyNormService],
  exports: [WeeklyNormService],
})
export class WeeklyNormModule {}
