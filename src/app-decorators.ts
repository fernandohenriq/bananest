export function Inject(token: string | { new (...args: any[]): {} }) {
  return function (target: any, propertyKey: string | symbol | undefined, parameterIndex: number) {
    const key = propertyKey || 'constructor';
    const existingInjectedParameters: any[] =
      Reflect.getOwnMetadata('inject_tokens', target, key) || [];
    existingInjectedParameters[parameterIndex] = typeof token === 'string' ? token : token.name;
    Reflect.defineMetadata('inject_tokens', existingInjectedParameters, target, key);
  };
}

export function Controller(prefix: string = '/') {
  return function (constructor: Function) {
    Reflect.defineMetadata('prefix', prefix, constructor);
  };
}

export function Get(path: string = '') {
  return Route(path, 'get');
}

export function Post(path: string = '') {
  return Route(path, 'post');
}

export function Put(path: string = '') {
  return Route(path, 'put');
}

export function Delete(path: string = '') {
  return Route(path, 'delete');
}

export function Patch(path: string = '') {
  return Route(path, 'patch');
}

function Route(path: string, method: 'get' | 'post' | 'put' | 'delete' | 'patch') {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    Reflect.defineMetadata('route', { path, method }, target, propertyKey);
  };
}
