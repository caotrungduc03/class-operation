import { Module } from '@nestjs/common';
import { RoleModule } from '../role/role.module';
import { UserModule } from '../user/user.module';
import { DatabaseSeederService } from './database-seeder.service';

@Module({
  imports: [UserModule, RoleModule],
  controllers: [],
  providers: [DatabaseSeederService],
})
export class DatabaseModule {}
