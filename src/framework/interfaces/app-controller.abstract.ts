import { Controller } from '../app-decorators';
import { AppHttp } from './app-http.interface';

@Controller('/')
export abstract class AppController {
  [key: string]: (http: AppHttp) => Promise<void>;
}
