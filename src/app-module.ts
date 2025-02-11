import express from 'express';
import { container } from 'tsyringe';
import { HttpContext } from './app-interfaces.js';
import { HttpHandlerOptions, HttpMiddlewareOptions } from './app-decorators.js';

type ProviderClass = new (...args: any[]) => any;
type ProviderInput = { token: string; useClass: ProviderClass };

export class AppModule {
  private router = express.Router();
  private app?: express.Application;

  private options: {
    prefix: string;
    providers: (ProviderInput | ProviderClass)[];
    imports: AppModule[];
  };

  constructor(options: Partial<AppModule['options']>) {
    // set options
    this.options = {
      prefix: this.parsePath(options.prefix ?? '/'),
      providers: options.providers ?? [],
      imports: options.imports ?? [],
    };

    // pre-register providers
    this.options.providers.forEach((providerOptions) => {
      const provider =
        'useClass' in providerOptions
          ? providerOptions.useClass
          : providerOptions;
      const token =
        'token' in providerOptions
          ? providerOptions.token
          : providerOptions.name;

      container.register(token, { useClass: provider });
    });
  }

  private parsePath(path: string) {
    if (!path) return '';
    return '/' + path.split('/').filter(Boolean).join('/');
  }

  export() {
    return {
      app: this.app,
      router: this.router,
      options: this.options,
    };
  }

  setup() {
    if (this.app) return this;
    this.app = express();
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.init();
    this.app.use(this.router);
    return this;
  }

  init() {
    const apiRouter = express.Router();

    this.options.providers.forEach((providerOptions) => {
      const provider =
        'useClass' in providerOptions
          ? providerOptions.useClass
          : providerOptions;
      const classInstance = container.resolve(provider);
      const prototype = Object.getPrototypeOf(classInstance);
      const classMethodNames = Object.getOwnPropertyNames(prototype).filter(
        (prop) => prop !== 'constructor',
      );

      const controllerOptions = Reflect.getMetadata(
        'provider:controller:options',
        provider,
      );

      if (controllerOptions) {
        classMethodNames.forEach((methodName) => {
          const providerHandler: (ctx: HttpContext) => any =
            classInstance[methodName].bind(classInstance);

          const httpHandlerOptions: HttpHandlerOptions = Reflect.getMetadata(
            'http:handler:options',
            prototype,
            methodName,
          );

          if (httpHandlerOptions) {
            const finalPath = this.parsePath(
              controllerOptions.prefix + '/' + httpHandlerOptions.path,
            );

            apiRouter[httpHandlerOptions.method](
              finalPath,
              async (req, res, next) => {
                try {
                  await providerHandler({ req, res, next });
                } catch (error) {
                  next(error);
                }
              },
            );
          }

          const httpMiddlewareOptions: HttpMiddlewareOptions =
            Reflect.getMetadata(
              'http:middleware:options',
              prototype,
              methodName,
            );

          if (httpMiddlewareOptions) {
            const finalPath = this.parsePath(
              controllerOptions.prefix + '/' + httpMiddlewareOptions?.path ||
                '/',
            );

            if (!httpMiddlewareOptions?.error) {
              apiRouter['use'](finalPath, async (req, res, next) => {
                try {
                  await providerHandler({ req, res, next });
                } catch (error) {
                  next(error);
                }
              });
            } else {
              apiRouter['use'](
                finalPath,
                async (err: any, req: any, res: any, next: any) => {
                  try {
                    await providerHandler({ err, req, res, next });
                  } catch (error) {
                    next(error);
                  }
                },
              );
            }
          }
        });
      }

      const middlewareOptions = Reflect.getMetadata(
        'provider:middleware:options',
        provider,
      );

      if (middlewareOptions) {
        classMethodNames.forEach((methodName) => {
          const providerHandler: (ctx: HttpContext) => any =
            classInstance[methodName].bind(classInstance);

          const httpMiddlewareOptions: HttpMiddlewareOptions =
            Reflect.getMetadata(
              'http:middleware:options',
              prototype,
              methodName,
            );

          const finalPath = this.parsePath(
            `/${middlewareOptions?.prefix ?? ''}/${httpMiddlewareOptions?.path ?? ''}`,
          );

          if (!httpMiddlewareOptions?.error) {
            apiRouter['use'](finalPath, async (req, res, next) => {
              try {
                await providerHandler({ req, res, next });
              } catch (error) {
                next(error);
              }
            });
          } else {
            apiRouter['use'](
              finalPath,
              async (err: any, req: any, res: any, next: any) => {
                try {
                  await providerHandler({ err, req, res, next });
                } catch (error) {
                  next(error);
                }
              },
            );
          }
        });
      }
    });

    this.options.imports.forEach((module) => {
      module.init();
      const moduleExported = module.export();
      this.router.use(this.options.prefix, moduleExported.router);
    });

    this.router.use(this.options.prefix, apiRouter);
    return this;
  }

  start(port: number, callback?: () => void) {
    this.setup();
    this.app?.listen(
      port,
      callback ??
        (() => {
          console.info(
            `[${this?.constructor?.name ?? 'AppModule'}] Running on http://localhost:${port}`,
          );
        }),
    );
  }
}
