import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hash, genSalt, compare } from 'bcrypt';

import { MailerService } from '../mailer/mailer.service';

import { User } from './users.entity';
import { UsersRepository } from './users.repository';

import { UpdateUserDTO } from './dto/updateUser.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersRepository) private readonly usersRepository: UsersRepository,
    private mailerService: MailerService,
  ) {}

  async findAll(): Promise<User[]> {
    const users = await this.usersRepository.find();

    return users;
  }

  async findByEmailOrUsername(emailOrUsename: string): Promise<User | undefined> {
    const user = await this.usersRepository.findByEmailOrUsername(emailOrUsename);

    return user;
  }

  /**
   * Validate user
   * @param emailOrUsername user email or username
   * @param password user password
   *
   * @return A promise to be either resolved with the `User` object or rejected with false
   */
  async validateUser(emailOrUsername: string, password: string): Promise<User | false> {
    const user = await this.findByEmailOrUsername(emailOrUsername);

    const isValid = user && (await compare(password, user.password));

    return (isValid && user) ?? false;
  }

  async findById(id: number): Promise<User | undefined> {
    const user = await this.usersRepository.findOne({ id });

    return user;
  }

  async createUser(email: string, username: string, password: string): Promise<User> {
    const salt = await genSalt(10);
    const hashedPassword = await hash(password, salt);

    const user = await this.usersRepository.createUser(email, username, hashedPassword);

    return user;
  }

  // TODO: rewrite this method
  async updateUser(user: User, payload: UpdateUserDTO): Promise<void> {
    const {
      password,
      newPassword,
      ...otherData
    } = payload;

    const isPasswordCorrect = await compare(password, user.password);

    // for update user we need current user's password
    if (!isPasswordCorrect) {
      throw new BadRequestException();
    }

    const newUserData: Partial<User> = {
      ...otherData,
    };

    // if user want to change password
    if (newPassword) {
      const salt = await genSalt(10);
      const hashedPassword = await hash(newPassword, salt);

      newUserData.password = hashedPassword;
    }

    await this.usersRepository.update(user.id, newUserData);

    if (newPassword) {
      this.mailerService.sendPasswordChangedMail(user.email, user.username);
    }
  }

  async updatePassword(email: string, password: string): Promise<void> {
    const salt = await genSalt(10);
    const hashedPassword = await hash(password, salt);

    await this.usersRepository.update({ email }, { password: hashedPassword });
  }

  async updateVerifyEmail(email: string, isVerified: boolean): Promise<void> {
    await this.usersRepository.update({ email }, {
      isVerified,
    });
  }
}
