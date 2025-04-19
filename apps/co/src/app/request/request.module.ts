import {
  RequestEntity,
  ScheduleEntity,
  WeeklyNormEntity,
} from '@class-operation/libs';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleService } from '../schedule/schedule.service';
import { WeeklyNormService } from '../weekly-norm/weekly-norm.service';
import { RequestController } from './request.controller';
import { RequestService } from './request.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([RequestEntity, WeeklyNormEntity, ScheduleEntity]),
  ],
  providers: [RequestService, WeeklyNormService, ScheduleService],
  controllers: [RequestController],
  exports: [RequestService],
})
export class RequestModule {}
