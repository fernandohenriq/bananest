import { IPagination } from './pagination/pagination.interface';
import { IQuery } from './pagination/query.interface';

export interface IRepo<T extends object> {
  save: (data: T) => Promise<T>;
  findOne: (query: IQuery<T>) => Promise<T | null>;
  findMany: (pagination: IPagination<T>) => Promise<T[]>;
}
