import { RequestEntity, WeeklyNormEntity } from '@class-operation/libs';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WeeklyNormService } from '../weekly-norm/weekly-norm.service';
import { RequestController } from './request.controller';
import { RequestService } from './request.service';

@Module({
  imports: [TypeOrmModule.forFeature([RequestEntity, WeeklyNormEntity])],
  providers: [RequestService, WeeklyNormService],
  controllers: [RequestController],
  exports: [RequestService],
})
export class RequestModule {}
