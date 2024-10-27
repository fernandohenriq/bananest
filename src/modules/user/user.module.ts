import { AppModule } from '../../framework/app-module';
import { UserControllers } from './user.controllers';
import { MemoryUserRepo } from './user.repo.memory';
import { UserService } from './user.service';

export const userModule = new AppModule({
  basePath: '/',
  controllers: [UserControllers],
  providers: [UserService, { token: 'UserRepo', value: MemoryUserRepo }],
});
