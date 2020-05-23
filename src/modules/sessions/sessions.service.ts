import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from '../users/users.entity';

import { Session } from './sessions.entity';
import { SessionsRepository } from './sessions.repository';

import { CreateSessionDTO } from './dto/createSession.dto';
import { UpdateSessionDTO } from './dto/updateSession.dto';

@Injectable()
export class SessionsService {
  constructor(@InjectRepository(SessionsRepository) private sessionsRepository: SessionsRepository) {}

  async createSession(payload: CreateSessionDTO, user: User): Promise<Session> {
    const sessionsCount = await this.sessionsRepository.countSessionsByUserId(user.id);

    if (sessionsCount >= 5) {
      await this.clearAllSessions(user.id);
    }

    const session = await this.sessionsRepository.createSession(payload, user);

    return session;
  }

  async findAllSessions(userId: number): Promise<Session[]> {
    const sessions = await this.sessionsRepository.findAllByUserId(userId);

    return sessions;
  }

  async findSession(token: string): Promise<Session | undefined> {
    const session = await this.sessionsRepository.findByToken(token);

    return session;
  }

  async updateSession(userId: number, token: string, payload: UpdateSessionDTO): Promise<void> {
    await this.sessionsRepository.update({ userId, token }, payload);
  }

  async clearAllSessions(userId: number): Promise<void> {
    await this.sessionsRepository.delete({ userId });
  }

  async clearSessionByToken(userId: number, token: string): Promise<void> {
    await this.sessionsRepository.delete({ userId, token });
  }

  async clearSessionById(userId: number, id: number): Promise<void> {
    await this.sessionsRepository.delete({ userId, id });
  }
}
