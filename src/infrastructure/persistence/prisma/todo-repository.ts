import { Temporal } from '@js-temporal/polyfill';
import type { PrismaClient } from 'lib/prisma';
import { Todo } from '@/domain/todo/entity';
import type { ITodoRepository } from '@/domain/todo/repository';
import { TodoBody } from '@/domain/todo/vo/body';
import { TodoId } from '@/domain/todo/vo/id';
import type { TodoStatus } from '@/domain/todo/vo/status';
import { TodoTitle } from '@/domain/todo/vo/title';
import { UserId } from '@/domain/user/vo/id';

/**
 * Prisma Todo Repository
 * Prismaを使用したTodoリポジトリの実装
 */
export class PrismaTodoRepository implements ITodoRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * IDでTodoを検索する
   */
  async find(id: TodoId): Promise<Todo | null> {
    const todoData = await this.prisma.todo.findUnique({
      where: { id: id.getValue() },
    });

    if (!todoData) {
      return null;
    }

    return this.toDomain(todoData);
  }

  /**
   * Todoを保存する（新規作成または更新）
   */
  async save(todo: Todo): Promise<void> {
    const todoData = this.toPersistence(todo);

    await this.prisma.todo.upsert({
      where: { id: todo.id.getValue() },
      create: todoData,
      update: {
        userId: todoData.userId,
        title: todoData.title,
        body: todoData.body,
        status: todoData.status,
        updatedAt: todoData.updatedAt,
      },
    });
  }

  /**
   * Todoを削除する
   */
  async delete(id: TodoId): Promise<void> {
    await this.prisma.todo.delete({
      where: { id: id.getValue() },
    });
  }

  /**
   * Prismaのデータモデルをドメインエンティティに変換
   */
  private toDomain(data: {
    id: string;
    userId: string;
    title: string;
    body: string | null;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  }): Todo {
    return Todo.reconstruct(
      TodoId.from(data.id),
      UserId.from(data.userId),
      TodoTitle.from(data.title),
      data.body === null || data.body === ''
        ? TodoBody.empty()
        : TodoBody.from(data.body),
      data.status as TodoStatus,
      Temporal.Instant.from(data.createdAt.toISOString()),
      Temporal.Instant.from(data.updatedAt.toISOString()),
    );
  }

  /**
   * ドメインエンティティをPrismaのデータモデルに変換
   */
  private toPersistence(todo: Todo): {
    id: string;
    userId: string;
    title: string;
    body: string | null;
    status: TodoStatus;
    createdAt: Date;
    updatedAt: Date;
  } {
    return {
      id: todo.id.getValue(),
      userId: todo.userId.getValue(),
      title: todo.title.getValue(),
      body: todo.body.isEmpty() ? null : todo.body.getValue(),
      status: todo.status,
      createdAt: new Date(todo.createdAt.epochMilliseconds),
      updatedAt: new Date(todo.updatedAt.epochMilliseconds),
    };
  }
}
