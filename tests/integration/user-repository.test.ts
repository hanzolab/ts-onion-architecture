import { Temporal } from '@js-temporal/polyfill';
import type { PrismaClient } from 'lib/prisma';
import { v7 as uuidv7 } from 'uuid';
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
} from 'vitest';
import { User } from '@/domain/user/entity';
import { Email } from '@/domain/user/vo/email';
import { UserId } from '@/domain/user/vo/id';
import { Username } from '@/domain/user/vo/username';
import { PrismaUserRepository } from '../../src/infrastructure/persistence/prisma/user-repository';
import { createPrismaClient, resetDatabase } from './helpers/database';

describe('PrismaUserRepository', () => {
  let prisma: PrismaClient;
  let repository: PrismaUserRepository;

  beforeAll(async () => {
    // PrismaClientとリポジトリを作成（テストスイート全体で共有）
    prisma = createPrismaClient();
    repository = new PrismaUserRepository(prisma);
  });

  afterAll(async () => {
    // 接続を切断
    if (prisma) {
      await prisma.$disconnect();
    }
  });

  beforeEach(async () => {
    await resetDatabase(prisma);
  });

  describe('find', () => {
    test('存在するユーザーをIDで検索できる', async () => {
      // Arrange: 事前にユーザーを作成
      const uuid = uuidv7();
      const name = Username.from(uuid);
      const email = Email.from(`${uuid}@example.com`);
      const user = User.create(email, name);
      await repository.save(user);

      // Act: 検索を実行
      const found = await repository.find(user.id);

      // Assert: 検索結果が正しいことを確認
      expect(found).not.toBeNull();
      expect(found?.id.equals(user.id)).toBe(true);
      expect(found?.email.equals(user.email)).toBe(true);
      expect(found?.name.equals(user.name)).toBe(true);
    });

    test('存在しないユーザーを検索するとnullを返す', async () => {
      // Arrange: 存在しないユーザーIDを生成
      const nonExistentId = UserId.generate();

      // Act: 検索を実行
      const found = await repository.find(nonExistentId);

      // Assert: 検索結果がnullであることを確認
      expect(found).toBeNull();
    });

    test('検索したユーザーの日時情報が正しく復元される', async () => {
      // Arrange: 事前にユーザーを作成
      const uuid = uuidv7();
      const name = Username.from(uuid);
      const email = Email.from(`${uuid}@example.com`);
      const user = User.create(email, name);
      await repository.save(user);

      // Act: 検索を実行
      const found = await repository.find(user.id);

      // Assert: 検索結果が正しいことを確認
      expect(found).not.toBeNull();
      if (!found) return;
      // Assert: 検索結果の日時情報が正しいことを確認
      expect(found.createdAt).toBeInstanceOf(Temporal.Instant);
      expect(found.updatedAt).toBeInstanceOf(Temporal.Instant);
      // Assert: データベースに保存・取得の過程でミリ秒精度が変わる可能性があるため、
      // 秒精度で比較する（1秒以内の差は許容）
      const createdAtDiff = Math.abs(
        found.createdAt.epochMilliseconds - user.createdAt.epochMilliseconds,
      );
      expect(createdAtDiff).toBeLessThan(1000);
    });
  });

  describe('save', () => {
    test('新しいユーザーを保存できる', async () => {
      // Arrange: 新しいユーザーを作成
      const uuid = uuidv7();
      const name = Username.from(uuid);
      const email = Email.from(`${uuid}@example.com`);
      const user = User.create(email, name);

      // Act: 保存を実行
      await repository.save(user);

      // Assert: データベースに保存されたことを確認
      const found = await repository.find(user.id);
      expect(found).not.toBeNull();
      expect(found?.id.equals(user.id)).toBe(true);
      expect(found?.email.equals(user.email)).toBe(true);
      expect(found?.name.equals(user.name)).toBe(true);
    });

    test('既存のユーザーを更新できる', async () => {
      // Arrange: 最初のユーザーを作成
      const uuid = uuidv7();
      const name = Username.from(uuid);
      const email = Email.from(`${uuid}@example.com`);
      const user = User.create(email, name);
      await repository.save(user);

      // Act: 少し待ってから更新（updatedAtが変わることを確認するため）
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Act: ユーザーを更新
      const newUuid = uuidv7();
      const newName = Username.from(newUuid);
      const newEmail = Email.from(`${newName}@example.com`);
      const updatedUser = user.changeEmail(newEmail).changeName(newName);
      await repository.save(updatedUser);

      // Assert: 更新されたことを確認
      const found = await repository.find(user.id);
      expect(found).not.toBeNull();
      expect(found?.email.equals(newEmail)).toBe(true);
      expect(found?.name.equals(newName)).toBe(true);
      expect(found?.id.equals(user.id)).toBe(true);
    });
  });

  describe('delete', () => {
    test('存在するユーザーを削除できる', async () => {
      // Arrange: 存在するユーザーを作成
      const uuid = uuidv7();
      const name = Username.from(uuid);
      const email = Email.from(`${uuid}@example.com`);
      const user = User.create(email, name);
      await repository.save(user);

      // Act: 削除前は存在することを確認
      const beforeDelete = await repository.find(user.id);
      expect(beforeDelete).not.toBeNull();

      // Act: 削除を実行
      await repository.delete(user.id);

      // Assert: 削除後は存在しないことを確認
      const afterDelete = await repository.find(user.id);
      expect(afterDelete).toBeNull();
    });

    test('存在しないユーザーを削除しようとするとエラーが発生する', async () => {
      // Arrange: 存在しないユーザーIDを生成
      const nonExistentId = UserId.generate();

      // Act & Assert: 削除を実行
      await expect(repository.delete(nonExistentId)).rejects.toThrow();
    });
  });
});
