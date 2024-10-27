import { Inject } from '../../framework/app-decorators';
import { IPagination } from '../shared/interfaces/pagination/pagination.interface';
import { User } from './user.entity';
import { UserRepo } from './user.repo.abstract';

export class UserService {
  constructor(
    @Inject('UserRepo')
    readonly userRepo: UserRepo,
  ) {}

  async createUser(data: { name: string }) {
    const user = new User({ ...data, id: '1' });
    await this.userRepo.save(user);
    return user;
  }

  async getUsers(input: { query: IPagination<User> }) {
    const { query } = input;
    return this.userRepo.findMany(query);
  }
}
