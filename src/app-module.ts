import express, { Request as ExpressRequest, Response as ExpressResponse, Router } from 'express';

import { AppContainer } from './app-container';
import { HttpContext, HttpRequest, HttpResponse } from './app-interfaces';

export type Provider = { new (...args: any[]): any };
export type ProviderConfig = { token: string; value: Provider };

export class AppModule {
  private basePath: string;
  private router: Router;
  private container: AppContainer;
  public app = express();

  private initialized = false;

  constructor(config: {
    basePath?: string;
    imports?: AppModule[];
    controllers?: any[];
    providers?: (Provider | ProviderConfig)[];
  }) {
    this.basePath = config.basePath ?? '/';
    this.router = Router();
    this.container = new AppContainer();

    if (Array.isArray(config.imports)) {
      config.imports.forEach((importModule) => {
        this.import(importModule);
      });
    }

    if (Array.isArray(config.providers)) {
      this.setupProviders(config.providers);
    }

    if (Array.isArray(config.controllers)) {
      this.setupControllers(config.controllers);
    }
  }

  private setupProviders(providers: any[]) {
    providers.forEach((provider) => {
      if ('name' in provider) {
        this.container.register(provider.name, provider);
      } else {
        this.container.register(provider.token, provider.value);
      }
    });
  }

  private setupControllers(controllers: any[]) {
    controllers.forEach((controller) => {
      this.container.register(controller.name, controller);
      const instance = this.container.resolve(controller);
      const prototype = Object.getPrototypeOf(instance);
      const prefix = Reflect.getMetadata('prefix', controller) || '';
      const methodNames = Object.getOwnPropertyNames(prototype).filter(
        (name) => name !== 'constructor' && typeof prototype[name] === 'function',
      );
      methodNames.forEach((methodName) => {
        const route = Reflect.getMetadata('route', prototype, methodName);
        if (route) {
          const path = route.path as string;
          const method = route.method as 'get' | 'post' | 'put' | 'delete' | 'patch';
          const fullPath = `${prefix}${path}`.replace(/\/+/g, '/');
          this.router[method](fullPath, (req, res, next) => {
            try {
              const httpContext: HttpContext<ExpressRequest, ExpressResponse> = { req, res };
              (instance as any)[methodName](httpContext);
            } catch (error) {
              next(error);
            }
          });
        }
      });
    });
  }

  init() {
    this.app.use(express.json());
    this.app.use(this.basePath, this.router);
    // route not found
    this.app.use((req: any, res: any, next: any) => {
      res.status(404).json({
        message: 'Route not found',
        path: req.path,
      });
    });
    // error handler
    this.app.use((err: any, req: any, res: any, next: any) => {
      res.status(500).json({
        message: err.message,
        path: req.path,
        stack: err.stack,
        body: JSON.stringify(err, null, 2),
      });
    });
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

  start(port: number = 3000) {
    if (!this.initialized) this.init();
    this.app.listen(port, () => {
      console.info(`[APP-MODULE] Server is on http://localhost:${port}`);
    });
  }
}
