import { AppModule } from '../framework/app-module';
import { userModule } from './user/user.module';

export const mainModule = new (class MainModule extends AppModule {
  constructor() {
    super({
      basePath: '/api',
      imports: [userModule],
    });
  }
})();
