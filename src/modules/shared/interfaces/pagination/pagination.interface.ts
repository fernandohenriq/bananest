import { IQuery } from './query.interface';

export type IPagination<T extends object = object> = {
  page?: number;
  limit?: number;
  sort?: 'asc' | 'desc';
  sortBy?: keyof T;
  query?: IQuery<T>;
};
