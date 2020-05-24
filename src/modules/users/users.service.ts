import { Injectable, InternalServerErrorException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from './users.entity';
import { UsersRepository } from './users.repository';

import { CreateUserDTO } from './dto/createUser.dto';
import { UpdateUserDTO } from './dto/updateUser.dto';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(UsersRepository) private readonly usersRepository: UsersRepository) {}

  async findAll(): Promise<User[]> {
    const users = await this.usersRepository.find();

    return users;
  }

  async findByEmailOrUsername(emailOrUsename: string): Promise<User | undefined> {
    const user = await this.usersRepository.findByEmailOrUsername(emailOrUsename);

    return user;
  }

  async findById(id: number): Promise<User | undefined> {
    const user = await this.usersRepository.findOne({ id });

    return user;
  }

  async createUser(payload: CreateUserDTO): Promise<User> {
    try {
      const user = await this.usersRepository.createUser(payload);

      return user;
    } catch (error) {
      if (error.code === '23505') throw new ConflictException({ code: 'REGISTER_ERROR' });

      throw new InternalServerErrorException();
    }
  }

  async updateUser(id: number, payload: UpdateUserDTO): Promise<void> {
    await this.usersRepository.update(id, payload);
  }

  async updateVerifyEmail(id: number, isVerified: boolean): Promise<void> {
    await this.usersRepository.update(id, {
      isVerified,
    });
  }
}
