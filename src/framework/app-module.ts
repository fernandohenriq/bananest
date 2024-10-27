import express, { Router } from 'express';
import 'reflect-metadata';

import { AppContainer } from './app-container';

type IProvider = { new (...args: any[]): any };
type IProviderConfig = { token: string; value: IProvider };

export class AppModule {
  private basePath: string;
  private router: Router;
  private container: AppContainer;
  private app = express();

  constructor(config: {
    basePath?: string;
    imports?: AppModule[];
    controllers?: any[];
    providers?: (IProvider | IProviderConfig)[];
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
              return (instance as any)[methodName](req, res, next);
            } catch (error) {
              next(error);
            }
          });
        }
      });
    });
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

  start(port: number = 80) {
    this.app.use(express.json());
    this.app.use(this.basePath, this.router);

    this.app.listen(port, () => {
      console.info(`[APP-MODULE] Server is on http://localhost:${port}`);
    });
  }
}
