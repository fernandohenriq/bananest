import { IPagination } from '../shared/interfaces/pagination/pagination.interface';
import { IRepo } from '../shared/interfaces/repo.interface';
import { User } from './user.entity';

export abstract class UserRepo implements IRepo<User> {
  abstract save: (data: User) => Promise<User>;
  abstract findOne: (query: Partial<User>) => Promise<User | null>;
  abstract findMany: (pagination: IPagination<User>) => Promise<User[]>;
}
