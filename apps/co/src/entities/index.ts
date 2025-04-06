import { DetailUser } from './detail-user.entity';
import { RoleEntity } from './role.entity';
import { UserEntity } from './user.entity';

const Entities = [RoleEntity, UserEntity, DetailUser] as const;

export { DetailUser, RoleEntity, UserEntity };
export default Entities;
