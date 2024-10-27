import { Controller, Get, Inject, Post } from '../../framework/app-decorators';
import { UserService } from './user.service';

@Controller('/users')
export class UserControllers {
  constructor(
    @Inject(UserService)
    readonly userService: UserService,
  ) {}

  @Post('/')
  async createUser(req: any, res: any) {
    const user = await this.userService.createUser(req.body);
    res.status(201).json({
      message: 'User created',
      data: user,
    });
  }

  @Get('/')
  async getUsers(req: any, res: any) {
    const users = await this.userService.getUsers(req.query);
    res.status(200).json({
      message: 'Users fetched',
      data: users,
    });
  }
}
