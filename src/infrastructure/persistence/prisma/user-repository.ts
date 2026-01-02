import { Temporal } from '@js-temporal/polyfill';
import type { PrismaClient } from 'lib/prisma';
import { User } from '@/domain/user/entity';
import type { IUserRepository } from '@/domain/user/repository';
import { Email } from '@/domain/user/vo/email';
import { UserId } from '@/domain/user/vo/id';
import { Username } from '@/domain/user/vo/username';

/**
 * Prisma User Repository
 * Prismaを使用したUserリポジトリの実装
 */
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * IDでユーザーを検索する
   */
  async find(id: UserId): Promise<User | null> {
    const userData = await this.prisma.user.findUnique({
      where: { id: id.getValue() },
    });

    if (!userData) {
      return null;
    }

    return this.toDomain(userData);
  }

  /**
   * ユーザーを保存する（新規作成または更新）
   */
  async save(user: User): Promise<void> {
    const userData = this.toPersistence(user);

    await this.prisma.user.upsert({
      where: { id: user.id.getValue() },
      create: userData,
      update: {
        email: userData.email,
        name: userData.name,
        updatedAt: userData.updatedAt,
      },
    });
  }

  /**
   * ユーザーを削除する
   */
  async delete(id: UserId): Promise<void> {
    await this.prisma.user.delete({
      where: { id: id.getValue() },
    });
  }

  /**
   * Prismaのデータモデルをドメインエンティティに変換
   */
  private toDomain(data: {
    id: string;
    email: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
  }): User {
    return User.reconstruct(
      UserId.from(data.id),
      Email.from(data.email),
      Username.from(data.name),
      Temporal.Instant.from(data.createdAt.toISOString()),
      Temporal.Instant.from(data.updatedAt.toISOString()),
    );
  }

  /**
   * ドメインエンティティをPrismaのデータモデルに変換
   */
  private toPersistence(user: User): {
    id: string;
    email: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: user.id.getValue(),
      email: user.email.getValue(),
      name: user.name.getValue(),
      createdAt: new Date(user.createdAt.epochMilliseconds),
      updatedAt: new Date(user.updatedAt.epochMilliseconds),
    };
  }
}
