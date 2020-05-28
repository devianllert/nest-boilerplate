import { Repository, EntityRepository } from 'typeorm';
import { createHash } from 'crypto';

import { User } from './users.entity';

@EntityRepository(User)
export class UsersRepository extends Repository<User> {
  async findByEmailOrUsername(emailOrUsername: string): Promise<User | undefined> {
    const user = await this.createQueryBuilder('user')
      .where('user.email = :email', { email: emailOrUsername })
      .orWhere('user.username = :username', { username: emailOrUsername })
      .getOne();

    return user;
  }

  async createUser(email: string, username: string, password: string): Promise<User> {
    const user = new User();

    const md5 = createHash('md5')
      .update(email)
      .digest('hex');

    user.email = email;
    user.username = username;
    user.password = password;
    user.avatar = `https://gravatar.com/avatar/${md5}?s=${200}&d=retro`;

    await this.save(user);

    return user;
  }
}
