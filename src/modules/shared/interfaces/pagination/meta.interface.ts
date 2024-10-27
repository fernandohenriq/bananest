import { IQuery } from './query.interface';

export type IMeta<T extends object = object> = {
  total: number;
  page: number;
  limit: number;
  maxItems: number;
  query?: IQuery<T>;
};
