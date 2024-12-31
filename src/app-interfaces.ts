export type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch';

export type HttpRequest<T = object> = T & {
  path: string;
  body?: any;
  params?: Record<string, any>;
  query?: Record<string, any>;
  headers?: Record<string, any>;
};

export type HttpResponse<T = object> = T & {
  status: (status: number) => HttpResponse<T>;
  send: <U = any>(body: U) => void;
};

export type HttpContext<T = object, U = object> = {
  req: HttpRequest<T>;
  res: HttpResponse<U>;
};
