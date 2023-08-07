import { User } from './entity/user.entity';

export interface UserRepository {
  save(user: User): void;
  findUserByEmail(userEmail: string): Promise<User>;
  findPasswordByEmail(id: string): Promise<User>;
  findUserById(id: string): Promise<User>;
  setPremiumUser(id: string): void;
}
