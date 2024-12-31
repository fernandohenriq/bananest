export type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch';

export type HttpRequest<T = object> = T & {
  path: string;
  method: HttpMethod;
  body?: any;
  params?: Record<string, any>;
  query?: Record<string, any>;
  headers?: Record<string, any>;
  cookies?: Record<string, any>;
};

export type HttpResponse<T = object> = T & {
  status: (status: number) => HttpResponse<T>;
  send: <U = any>(body: U) => void;
};

export type HttpContext = {
  req: HttpRequest;
  res: HttpResponse;
};
