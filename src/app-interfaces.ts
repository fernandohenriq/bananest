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

export type HttpNext<E = unknown> = (err?: E) => void;

export type HttpError<E = unknown> = E;

export type HttpContext<T = object, U = object, E = unknown> = {
  req: HttpRequest<T>;
  res: HttpResponse<U>;
  next?: HttpNext<E>;
};

export type HttpMiddlewareContext<T = object, U = object, E = unknown> = {
  req: HttpRequest<T>;
  res: HttpResponse<U>;
  err?: HttpError<E>;
  next?: HttpNext<E>;
};
