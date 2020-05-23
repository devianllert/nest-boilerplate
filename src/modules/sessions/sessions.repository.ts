import { Repository, EntityRepository } from 'typeorm';

import { User } from '../users/users.entity';
import { Session } from './sessions.entity';

import { CreateSessionDTO } from './dto/createSession.dto';

@EntityRepository(Session)
export class SessionsRepository extends Repository<Session> {
  async createSession(payload: CreateSessionDTO, user: User): Promise<Session> {
    const session = new Session();

    session.token = payload.token;
    session.ip = payload.ip;
    session.expiresIn = payload.expiresIn;
    session.userAgent = payload.userAgent;
    session.browser = payload.browser;
    session.os = payload.os;
    session.token = payload.token;
    session.user = user;

    await this.save(session);

    return session;
  }

  async countSessionsByUserId(userId: number): Promise<number> {
    const count = await this.createQueryBuilder('session')
      .where('session.userId = :userId', { userId })
      .getCount();

    return count;
  }

  async findAllByUserId(userId: number): Promise<Session[]> {
    const sessions = await this.find({ userId });

    return sessions;
  }

  async findByUserIdAndToken(userId: number, token: string): Promise<Session | undefined> {
    const session = await this.findOne({ userId, token });

    return session;
  }

  async findByToken(token: string): Promise<Session | undefined> {
    const session = await this.findOne({ token });

    return session;
  }
}
