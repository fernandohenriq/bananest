export type AppHttp<T = any> = {
  req: {
    auth?: { userId: string };
    body: T;
    query: Record<string, string>;
    params: Record<string, string>;
    headers: {
      [key: string]: string | undefined;
      Authorization: string | undefined;
    };
  };
  res: {
    status: (status: number) => AppHttp<T>['res'];
    send: <V = any>(data: V) => void;
  };
  next?: (err: any) => void;
};
