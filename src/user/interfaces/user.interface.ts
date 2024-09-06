import { Role } from 'src/common/decorators/roles/role.enum';

export interface User {
  id: number;
  email: string;
  password: string;
  roles: Role[];
}
