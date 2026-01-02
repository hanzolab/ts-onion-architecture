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
import { Todo } from '@/domain/todo/entity';
import { TodoBody } from '@/domain/todo/vo/body';
import { TodoId } from '@/domain/todo/vo/id';
import { TodoStatus } from '@/domain/todo/vo/status';
import { TodoTitle } from '@/domain/todo/vo/title';
import { User } from '@/domain/user/entity';
import { Email } from '@/domain/user/vo/email';
import { Username } from '@/domain/user/vo/username';
import { PrismaTodoRepository } from '../../src/infrastructure/persistence/prisma/todo-repository';
import { PrismaUserRepository } from '../../src/infrastructure/persistence/prisma/user-repository';
import { createPrismaClient, resetDatabase } from './helpers/database';

describe('PrismaTodoRepository', () => {
  let prisma: PrismaClient;
  let repository: PrismaTodoRepository;
  let userRepository: PrismaUserRepository;
  let testUser: User;

  beforeAll(async () => {
    // PrismaClientとリポジトリを作成（テストスイート全体で共有）
    prisma = createPrismaClient();
    repository = new PrismaTodoRepository(prisma);
    userRepository = new PrismaUserRepository(prisma);
  });

  afterAll(async () => {
    // 接続を切断
    if (prisma) {
      await prisma.$disconnect();
    }
  });

  beforeEach(async () => {
    // DBをリセット
    await resetDatabase(prisma);

    // テスト用のユーザーを作成
    const uuid = uuidv7();
    const name = Username.from(uuid);
    const email = Email.from(`${uuid}@example.com`);
    testUser = User.create(email, name);
    await userRepository.save(testUser);
  });

  describe('find', () => {
    test('存在するTodoをIDで検索できる', async () => {
      // Arrange: 事前にTodoを作成
      const title = TodoTitle.from('Test Todo');
      const todo = Todo.create(testUser.id, title);
      await repository.save(todo);

      // Act: 検索を実行
      const found = await repository.find(todo.id);

      // Assert: 検索結果が正しいことを確認
      expect(found).not.toBeNull();
      expect(found?.id.equals(todo.id)).toBe(true);
      expect(found?.userId.equals(todo.userId)).toBe(true);
      expect(found?.title.equals(todo.title)).toBe(true);
      expect(found?.body.equals(todo.body)).toBe(true);
      expect(found?.status).toBe(todo.status);
    });

    test('存在しないTodoを検索するとnullを返す', async () => {
      // Arrange: 存在しないTodoIDを生成
      const nonExistentId = TodoId.generate();

      // Act: 検索を実行
      const found = await repository.find(nonExistentId);

      // Assert: 検索結果がnullであることを確認
      expect(found).toBeNull();
    });

    test('検索したTodoの日時情報が正しく復元される', async () => {
      // Arrange: 事前にTodoを作成
      const title = TodoTitle.from('Test Todo');
      const todo = Todo.create(testUser.id, title);
      await repository.save(todo);

      // Act: 検索を実行
      const found = await repository.find(todo.id);

      // Assert: 検索結果が正しいことを確認
      expect(found).not.toBeNull();
      if (!found) return;
      // Assert: 検索結果の日時情報が正しいことを確認
      expect(found.createdAt).toBeInstanceOf(Temporal.Instant);
      expect(found.updatedAt).toBeInstanceOf(Temporal.Instant);
      // Assert: データベースに保存・取得の過程でミリ秒精度が変わる可能性があるため、
      // 秒精度で比較する（1秒以内の差は許容）
      const createdAtDiff = Math.abs(
        found.createdAt.epochMilliseconds - todo.createdAt.epochMilliseconds,
      );
      expect(createdAtDiff).toBeLessThan(1000);
    });
  });

  describe('save', () => {
    test('新しいTodoを保存できる', async () => {
      // Arrange: 新しいTodoを作成
      const title = TodoTitle.from('New Todo');
      const todo = Todo.create(testUser.id, title);

      // Act: 保存を実行
      await repository.save(todo);

      // Assert: データベースに保存されたことを確認
      const found = await repository.find(todo.id);
      expect(found).not.toBeNull();
      expect(found?.id.equals(todo.id)).toBe(true);
      expect(found?.userId.equals(todo.userId)).toBe(true);
      expect(found?.title.equals(todo.title)).toBe(true);
      expect(found?.body.equals(todo.body)).toBe(true);
      expect(found?.status).toBe(todo.status);
    });

    test('既存のTodoを更新できる', async () => {
      // Arrange: 最初のTodoを作成
      const title = TodoTitle.from('Original Todo');
      const todo = Todo.create(testUser.id, title);
      await repository.save(todo);

      // Act: 少し待ってから更新（updatedAtが変わることを確認するため）
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Act: Todoを更新
      const newTitle = TodoTitle.from('Updated Todo');
      const newBody = TodoBody.from('Updated body');
      const newStatus = TodoStatus.IN_PROGRESS;
      const updatedTodo = todo
        .changeTitle(newTitle)
        .changeBody(newBody)
        .changeStatus(newStatus);
      await repository.save(updatedTodo);

      // Assert: 更新されたことを確認
      const found = await repository.find(todo.id);
      expect(found).not.toBeNull();
      expect(found?.title.equals(newTitle)).toBe(true);
      expect(found?.body.equals(newBody)).toBe(true);
      expect(found?.status).toBe(newStatus);
      expect(found?.id.equals(todo.id)).toBe(true);
    });
  });

  describe('delete', () => {
    test('存在するTodoを削除できる', async () => {
      // Arrange: 存在するTodoを作成
      const title = TodoTitle.from('Todo to delete');
      const todo = Todo.create(testUser.id, title);
      await repository.save(todo);

      // Act: 削除前は存在することを確認
      const beforeDelete = await repository.find(todo.id);
      expect(beforeDelete).not.toBeNull();

      // Act: 削除を実行
      await repository.delete(todo.id);

      // Assert: 削除後は存在しないことを確認
      const afterDelete = await repository.find(todo.id);
      expect(afterDelete).toBeNull();
    });

    test('存在しないTodoを削除しようとするとエラーが発生する', async () => {
      // Arrange: 存在しないTodoIDを生成
      const nonExistentId = TodoId.generate();

      // Act & Assert: 削除を実行
      await expect(repository.delete(nonExistentId)).rejects.toThrow();
    });
  });
});
