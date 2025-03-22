import { RoleEntity } from './role.entity';
import { UserEntity } from './user.entity';

const Entities = [RoleEntity, UserEntity] as const;

export { RoleEntity, UserEntity };
export default Entities;
