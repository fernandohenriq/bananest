import { inject, injectable } from 'tsyringe';
import { HttpMethod } from './app-interfaces.js';

export function Inject(token: string | symbol | (new (...args: any[]) => any)) {
  return inject(token);
}

export function Injectable() {
  return (target: any) => {
    return injectable()(target);
  };
}

export function Provider() {
  return function (constructor: Function) {
    Reflect.defineMetadata('provider', true, constructor);
    return Injectable()(constructor);
  };
}

export type ControllerOptions = {
  prefix?: string;
};

export function Controller(options: ControllerOptions = {}) {
  return function (constructor: Function) {
    Reflect.defineMetadata('provider:controller', true, constructor);
    Reflect.defineMetadata('provider:controller:options', options, constructor);
    return Provider()(constructor);
  };
}

export function Middleware(options: ControllerOptions = {}) {
  return function (target: any) {
    options = { ...options, prefix: options.prefix || '/' };
    Reflect.defineMetadata('provider:middleware', true, target);
    Reflect.defineMetadata('provider:middleware:options', options, target);
    return Injectable()(target);
  };
}

export type HttpMiddlewareOptions = {
  error?: boolean;
  path?: string;
};

export function HttpMiddleware(
  path: string,
  options?: Omit<HttpMiddlewareOptions, 'path'>,
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    Reflect.defineMetadata('http:middleware', true, target, propertyKey);
    Reflect.defineMetadata(
      'http:middleware:options',
      { ...options, path },
      target,
      propertyKey,
    );
    return descriptor;
  };
}

export type HttpHandlerOptions = {
  path: string;
  method: HttpMethod;
};

function HttpHandler(method: HttpMethod, path: string = '/') {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const options: HttpHandlerOptions = { method, path };
    Reflect.defineMetadata('http:handler', true, target, propertyKey);
    Reflect.defineMetadata(
      'http:handler:options',
      options,
      target,
      propertyKey,
    );
    return descriptor;
  };
}

export function HttpPost(path?: string) {
  return HttpHandler('post', path);
}

export function HttpGet(path?: string) {
  return HttpHandler('get', path);
}

export function HttpPut(path?: string) {
  return HttpHandler('put', path);
}

export function HttpPatch(path?: string) {
  return HttpHandler('patch', path);
}

export function HttpDelete(path?: string) {
  return HttpHandler('delete', path);
}
