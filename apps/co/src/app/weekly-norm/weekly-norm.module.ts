import { WeeklyNormEntity } from '@class-operation/libs';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WeeklyNormService } from './weekly-norm.service';

@Module({
  imports: [TypeOrmModule.forFeature([WeeklyNormEntity])],
  providers: [WeeklyNormService],
  exports: [WeeklyNormService],
})
export class WeeklyNormModule {}
