import { AppModule } from '../framework/app-module';
import { userModule } from './user/user.module';

export class MainModule extends AppModule {
  constructor() {
    super({
      basePath: '/api',
      imports: [userModule],
    });
  }
}
