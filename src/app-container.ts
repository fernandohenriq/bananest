import 'reflect-metadata';

type Constructor<T = any> = new (...args: any[]) => T;

export class AppContainer {
  private services = new Map<string, Constructor>();

  register<T>(token: string, constructor: Constructor<T>) {
    if (this.services.has(token)) {
      throw new Error(`Service ${token} is already registered.`);
    }
    this.services.set(token, constructor);
  }

  resolve<T>(token: string | Constructor<T>): T {
    const tokenString = typeof token === 'string' ? token : token.name;
    const constructor = this.services.get(tokenString);
    if (!constructor) {
      throw new Error(`Service ${tokenString} is not registered.`);
    }

    const paramTypes: Array<any> = Reflect.getMetadata('design:paramtypes', constructor) || [];

    const injectTokens: Array<string | undefined> =
      Reflect.getOwnMetadata('inject_tokens', constructor, 'constructor') || [];

    const dependencies = paramTypes.map((param: any, index: number) => {
      const injectToken = injectTokens[index];
      const dependencyToken = injectToken || param.name;
      return this.resolve(dependencyToken);
    });

    return new constructor(...dependencies);
  }

  import(services: Map<string, Constructor>) {
    services.forEach((service, token) => {
      this.register(token, service);
    });
  }

  export() {
    return this.services;
  }
}
