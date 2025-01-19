import express, {
  NextFunction as ExpressNextFunction,
  Request as ExpressRequest,
  Response as ExpressResponse,
  Router,
} from 'express';

import { AppContainer } from './app-container';
import { HttpContext, HttpMiddlewareContext, HttpRequest, HttpResponse } from './app-interfaces';

export type Provider = { new (...args: any[]): any };
export type ProviderConfig = { token: string; value: Provider };
export type ControllerProvider = { new (...args: any[]): any };
export type MiddlewareProvider = { new (...args: any[]): any };

export class AppModule {
  private basePath: string;
  private router: Router;
  private container: AppContainer;
  private errorHandler: (ctx: HttpMiddlewareContext) => void;
  private routeNotFound: (ctx: HttpMiddlewareContext) => void;
  public app = express();

  private initialized = false;

  constructor(config: {
    basePath?: string;
    imports?: AppModule[];
    controllers?: ControllerProvider[];
    middlewares?: MiddlewareProvider[];
    providers?: (Provider | ProviderConfig)[];
    errorHandler?: (ctx: HttpMiddlewareContext) => void;
    routeNotFound?: (ctx: HttpMiddlewareContext) => void;
  }) {
    this.basePath = config.basePath ?? '/';
    this.router = Router();
    this.container = new AppContainer();
    this.errorHandler = config.errorHandler ?? (() => {});
    this.routeNotFound = config.routeNotFound ?? (() => {});

    if (Array.isArray(config.imports)) {
      config.imports.forEach((importModule) => {
        this.import(importModule);
      });
    }

    if (Array.isArray(config.middlewares)) {
      this.setMiddlewares(config.middlewares);
    }

    if (Array.isArray(config.providers)) {
      this.setProviders(config.providers);
    }

    if (Array.isArray(config.controllers)) {
      this.setControllers(config.controllers);
    }
  }

  setProviders(providers: any[]) {
    providers.forEach((provider) => {
      if ('name' in provider) {
        this.container.register(provider.name, provider);
      } else {
        this.container.register(provider.token, provider.value);
      }
    });
  }

  setMiddlewares(middlewares: any[]) {
    middlewares.forEach((middlewares) => {
      this.container.register(middlewares.name, middlewares);
      const instance = this.container.resolve(middlewares);
      const prototype = Object.getPrototypeOf(instance);
      const methodNames = Object.getOwnPropertyNames(prototype).filter(
        (name) => name !== 'constructor' && typeof prototype[name] === 'function',
      );
      methodNames.forEach((methodName) => {
        const middleware = Reflect.getMetadata('middleware', prototype, methodName);
        if (middleware) {
          const { includeErr = false, routeNotFound = false, errorHandler = false } = middleware;
          if (routeNotFound) {
            this.routeNotFound = (instance as any)[methodName];
            return;
          }
          if (errorHandler) {
            this.errorHandler = (instance as any)[methodName];
            return;
          }
          if (includeErr) {
            middlewares.push((err: any, req: any, res: any, next: any) => {
              try {
                (instance as any)[methodName]({ err, req, res, next });
              } catch (error) {
                next(error);
              }
            });
            return;
          }
          middlewares.push((req: any, res: any, next: any) => {
            try {
              const httpContext: HttpMiddlewareContext = { req, res, next };
              (instance as any)[methodName](httpContext);
            } catch (error) {
              next(error);
            }
          });
        }
      });
    });
  }

  setControllers(controllers: any[]) {
    controllers.forEach((controller) => {
      this.container.register(controller.name, controller);
      const instance = this.container.resolve(controller);
      const prototype = Object.getPrototypeOf(instance);
      const prefix = Reflect.getMetadata('prefix', controller) || '';
      const methodNames = Object.getOwnPropertyNames(prototype).filter(
        (name) => name !== 'constructor' && typeof prototype[name] === 'function',
      );
      const middlewares: ((...args: any[]) => void)[] = [];
      methodNames.forEach((methodName) => {
        const middleware = Reflect.getMetadata('middleware', prototype, methodName);
        if (middleware) {
          const { includeErr = false } = middleware;
          if (includeErr) {
            middlewares.push((err: any, req: any, res: any, next: any) => {
              try {
                const httpContext: HttpMiddlewareContext = { err, req, res, next };
                (instance as any)[methodName](httpContext);
              } catch (error) {
                next(error);
              }
            });
          } else {
            middlewares.push((req: any, res: any, next: any) => {
              try {
                const httpContext: HttpMiddlewareContext = { req, res, next };
                (instance as any)[methodName](httpContext);
              } catch (error) {
                next(error);
              }
            });
          }
        }
      });
      methodNames.forEach((methodName) => {
        const route = Reflect.getMetadata('route', prototype, methodName);
        if (route) {
          const path = route.path as string;
          const method = route.method as 'get' | 'post' | 'put' | 'delete' | 'patch';
          const fullPath = `${prefix}${path}`.replace(/\/+/g, '/');
          this.router[method](fullPath, middlewares, (req: any, res: any, next: any) => {
            try {
              const httpContext: HttpContext<ExpressRequest, ExpressResponse> = { req, res, next };
              (instance as any)[methodName](httpContext);
            } catch (error) {
              next(error);
            }
          });
          return;
        }
      });
    });
  }

  init() {
    const router = Router();
    this.app.use(express.json());
    this.app.use(this.basePath, this.router);
    // route not found
    if (this.routeNotFound) {
      router.use((req: any, res: any, next: any) => {
        this.routeNotFound({ req, res, next });
      });
    } else {
      this.app.use((req: any, res: any, next: any) => {
        res.status(404).json({
          message: 'Route not found',
          path: req.path,
        });
      });
    }
    // error handler
    if (this.errorHandler) {
      router.use((err: any, req: any, res: any, next: any) => {
        this.errorHandler({ err, req, res, next });
      });
    } else {
      this.app.use((err: any, req: any, res: any, next: any) => {
        res.status(500).json({
          message: err.message,
          path: req.path,
          stack: err.stack,
          body: JSON.stringify(err, null, 2),
        });
      });
    }
    this.initialized = true;
    return this;
  }

  import(module: AppModule) {
    const { basePath, router, container } = module.export();
    this.container.import(container);
    this.router.use(basePath, router);
  }

  export() {
    return {
      basePath: this.basePath,
      router: this.router,
      container: this.container.export(),
    };
  }

  getApp() {
    return this.app;
  }

  close() {
    this.initialized = false;
    process.exit(0);
  }

  start(port: number = 3000, callback?: (port?: number) => void) {
    if (!this.initialized) this.init();
    this.app.listen(port, () => {
      callback
        ? callback(port)
        : console.info(`[${this.constructor.name}] Server is on http://localhost:${port}`);
    });
  }
}
