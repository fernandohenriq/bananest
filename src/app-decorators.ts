import { inject, injectable } from 'tsyringe';

import { HttpMethod } from './app-interfaces.js';

export type ControllerOptions = {
  prefix?: string;
};

export type HttpMiddlewareOptions = {
  error?: boolean;
};

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
    Reflect.defineMetadata('provider:basic', true, constructor);
    return Injectable()(constructor);
  };
}

export function Controller(options: ControllerOptions = {}) {
  return function (constructor: Function) {
    const { prefix = '/' } = options;
    Reflect.defineMetadata('provider:controller', true, constructor);
    Reflect.defineMetadata('provider:controller:options', options, constructor);
    Reflect.defineMetadata('provider:prefix', prefix, constructor);
    return Injectable()(constructor);
  };
}

export function Middleware(options: ControllerOptions = {}) {
  return function (target: any) {
    const { prefix = '/' } = options;
    Reflect.defineMetadata('provider:middleware', true, target);
    Reflect.defineMetadata('provider:middleware:options', options, target);
    Reflect.defineMetadata('provider:prefix', prefix, target);
    return Injectable()(target);
  };
}

export function HttpMiddleware(path: string, options?: HttpMiddlewareOptions) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    Reflect.defineMetadata('http:middleware', true, target, propertyKey);
    Reflect.defineMetadata('http:middleware:path', path, target, propertyKey);
    Reflect.defineMetadata('http:middleware:options', options, target, propertyKey);
    return descriptor;
  };
}

function HttpHandler(method: HttpMethod, path: string = '/') {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    Reflect.defineMetadata('http:handler', true, target, propertyKey);
    Reflect.defineMetadata('http:handler:path', path, target, propertyKey);
    Reflect.defineMetadata('http:handler:method', method, target, propertyKey);
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
