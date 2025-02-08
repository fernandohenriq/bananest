import express from 'express';
import { container } from 'tsyringe';

import { HttpMiddlewareOptions } from './app-decorators.js';
import { HttpContext, HttpMethod } from './app-interfaces.js';

type ProviderClass = new (...args: any[]) => any;
type ProviderInput = { token: string; useClass: ProviderClass };

export class AppModule {
  private app?: express.Application;
  private router: express.Router = express.Router();

  constructor(
    public config: {
      prefix?: string;
      imports?: AppModule[];
      providers?: (ProviderClass | ProviderInput)[];
      cors?: {
        allowedOrigin?: string;
        allowedMethods?: string[];
        allowedHeaders?: string[];
      };
    },
  ) {
    this.router.use((req, res, next) => {
      res.setHeader('Access-Control-Allow-Origin', this.config?.cors?.allowedOrigin ?? '*');
      res.setHeader(
        'Access-Control-Allow-Methods',
        this.config?.cors?.allowedMethods?.join(', ') ?? 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      );
      if (this.config.cors && Array.isArray(this.config.cors?.allowedHeaders)) {
        res.setHeader('Access-Control-Allow-Headers', this.config.cors.allowedHeaders.join(', '));
      }
      next();
    });
  }

  init() {
    this.app = express();
    this.app.use(express.json());

    this.config.imports?.forEach((module) => module.init());
    this.config.providers?.forEach((provider) => {
      container.register(
        'token' in provider ? provider.token : provider?.name,
        'useClass' in provider ? provider.useClass : provider,
      );
    });
    this.config.providers?.forEach((providerOptions) => {
      const provider = 'useClass' in providerOptions ? providerOptions.useClass : providerOptions;
      const instance = container.resolve(provider);
      const prototype = Object.getPrototypeOf(instance);
      const handlers = Object.getOwnPropertyNames(prototype).filter(
        (prop) => prop !== 'constructor',
      );
      const router = express.Router();
      handlers.forEach((handler) => {
        const isHttpHandler = Reflect.getMetadata('http:handler', prototype, handler);
        if (isHttpHandler) {
          const path = Reflect.getMetadata('http:handler:path', prototype, handler);
          const method: HttpMethod = Reflect.getMetadata('http:handler:method', prototype, handler);
          const finalPath = `/${path.split('/').filter(Boolean).join('/')}`;
          router[method](finalPath, (req: any, res: any, next: any) => {
            try {
              const ctx: HttpContext = { req, res, next };
              instance[handler].bind(instance)(ctx);
            } catch (error) {
              next(error);
            }
          });
        }
        const isHttpMiddleware = Reflect.getMetadata('http:middleware', prototype, handler);
        if (isHttpMiddleware) {
          const path = Reflect.getMetadata('http:middleware:path', prototype, handler);
          const options: HttpMiddlewareOptions = Reflect.getMetadata(
            'http:middleware:options',
            prototype,
            handler,
          );
          const finalPath = `/${path.split('/').filter(Boolean).join('/')}`;
          if (!options?.error) {
            router['use'](finalPath, (req: any, res: any, next: any) => {
              try {
                const ctx: HttpContext = { req, res, next };
                instance[handler].bind(instance)(ctx);
              } catch (error) {
                next(error);
              }
            });
          } else {
            router['use'](finalPath, (err: any, req: any, res: any, next: any) => {
              try {
                const ctx: HttpContext = { err, req, res, next };
                instance[handler].bind(instance)(ctx);
              } catch (error) {
                next(error);
              }
            });
          }
        }
        return;
      });
      const prefix = Reflect.getMetadata('provider:prefix', provider) ?? '/';
      const parsedPrefix = `/${prefix?.split('/').filter(Boolean).join('/')}`;
      this.router.use(parsedPrefix, router);
    });
    this.config.imports?.forEach((module) => this.router.use(module.router));
    const prefix = `/${this.config?.prefix?.split('/').filter(Boolean).join('/') ?? ''}`;
    this.app.use(prefix, this.router);
    return this;
  }

  start(port: number, callback?: () => void) {
    if (!this.app) this.init();
    this.app!.listen(
      port,
      callback ??
        (() => {
          console.info(`[${this.constructor.name}] Running on http://localhost:${port}`);
        }),
    );
    return this;
  }
}
