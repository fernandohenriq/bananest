import { MainModule } from './modules/main.module';

const mainModule = new MainModule();

mainModule.init().start(3000);
