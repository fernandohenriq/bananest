import { IPagination } from '../shared/interfaces/pagination/pagination.interface';
import { User } from './user.entity';
import { UserRepo } from './user.repo.abstract';

export class MemoryUserRepo implements UserRepo {
  private users: User[] = [];

  async save(data: User): Promise<User> {
    this.users.push(data);
    console.log(`[MemoryUserRepo] User created:`, data);
    return data;
  }

  async findOne(query: Partial<User>): Promise<User | null> {
    return this.users.find((user) => user.id === query.id) ?? null;
  }

  async findMany(pagination: IPagination<User>): Promise<User[]> {
    const { page = 1, limit = 10, sort = 'asc', sortBy = 'id', query = {} } = pagination ?? {};
    return this.users
      .filter((user) =>
        Object.entries(query).every(([key, value]) => user[key as keyof User] === value),
      )
      .sort((a, b) => {
        const aValue = a[sortBy as keyof User];
        const bValue = b[sortBy as keyof User];
        if (aValue === bValue) return 0;
        if (sort === 'asc') return aValue < bValue ? -1 : 1;
        return aValue > bValue ? -1 : 1;
      })
      .slice((page - 1) * limit, page * limit);
  }
}
