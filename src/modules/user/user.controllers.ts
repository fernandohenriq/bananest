import { Controller, Get, Inject, Post } from '../../framework/app-decorators';
import { User } from './user.entity';
import { UserService } from './user.service';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

@Controller('/users')
export class UserControllers {
  constructor(
    @Inject('UserService')
    readonly userService: UserService,
  ) {}

  @Post('/')
  async createUser(req: any, res: any) {
    const user = new User(req.body);
    const isValidEmail = emailRegex.test(user.email);
    if (!isValidEmail) {
      return res.status(400).json({
        message: 'Invalid email',
      });
    }
    const isValidPassword = passwordRegex.test(user.password);
    if (!isValidPassword) {
      return res.status(400).json({
        message: 'Invalid password',
      });
    }
    await this.userService.createUser(user);
    res.status(201).json({
      message: 'User created',
      data: user,
    });
  }

  @Get('/')
  async getUsers(req: any, res: any) {
    const query = req.query;

    const users = await this.userService.getUsers(query);

    res.status(200).json({
      message: 'Users fetched',
      data: users,
    });
  }
}
