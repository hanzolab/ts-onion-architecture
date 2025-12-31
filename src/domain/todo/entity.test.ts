import { Temporal } from '@js-temporal/polyfill';
import { describe, expect, test } from 'vitest';
import { UserId } from '../user/vo/id';
import { Todo } from './entity';
import { TodoBody } from './vo/body';
import { TodoId } from './vo/id';
import { TodoStatus } from './vo/status';
import { TodoTitle } from './vo/title';

describe('Todo', () => {
  describe('create', () => {
    test('新しいTodoを作成できる', () => {
      const userId = UserId.generate();
      const title = TodoTitle.from('My Todo');

      const todo = Todo.create(userId, title);

      expect(todo).toBeInstanceOf(Todo);
      expect(todo.id).toBeInstanceOf(TodoId);
      expect(todo.userId.equals(userId)).toBe(true);
      expect(todo.title.equals(title)).toBe(true);
      expect(todo.body.isEmpty()).toBe(true);
      expect(todo.status).toBe(TodoStatus.NOT_STARTED);
      expect(todo.createdAt).toBeInstanceOf(Temporal.Instant);
      expect(todo.updatedAt).toBeInstanceOf(Temporal.Instant);
      expect(todo.createdAt.equals(todo.updatedAt)).toBe(true);
    });

    test('本文を指定してTodoを作成できる', () => {
      const userId = UserId.generate();
      const title = TodoTitle.from('My Todo');
      const body = TodoBody.from('This is a todo body');

      const todo = Todo.create(userId, title, body);

      expect(todo.body.equals(body)).toBe(true);
    });
  });

  describe('reconstruct', () => {
    test('既存のTodoを復元できる', () => {
      const id = TodoId.generate();
      const userId = UserId.generate();
      const title = TodoTitle.from('My Todo');
      const body = TodoBody.from('Todo body');
      const status = TodoStatus.IN_PROGRESS;
      const createdAt = Temporal.Instant.from('2024-01-01T00:00:00Z');
      const updatedAt = Temporal.Instant.from('2024-01-02T00:00:00Z');

      const todo = Todo.reconstruct(
        id,
        userId,
        title,
        body,
        status,
        createdAt,
        updatedAt,
      );

      expect(todo).toBeInstanceOf(Todo);
      expect(todo.id.equals(id)).toBe(true);
      expect(todo.userId.equals(userId)).toBe(true);
      expect(todo.title.equals(title)).toBe(true);
      expect(todo.body.equals(body)).toBe(true);
      expect(todo.status).toBe(status);
      expect(todo.createdAt.equals(createdAt)).toBe(true);
      expect(todo.updatedAt.equals(updatedAt)).toBe(true);
    });
  });

  describe('changeTitle', () => {
    test('タイトルを変更できる', () => {
      const userId = UserId.generate();
      const todo = Todo.create(userId, TodoTitle.from('Old Title'));
      const newTitle = TodoTitle.from('New Title');

      const updatedTodo = todo.changeTitle(newTitle);

      expect(updatedTodo.title.equals(newTitle)).toBe(true);
      expect(updatedTodo.id.equals(todo.id)).toBe(true);
      expect(updatedTodo.userId.equals(todo.userId)).toBe(true);
      expect(updatedTodo.body.equals(todo.body)).toBe(true);
      expect(updatedTodo.status).toBe(todo.status);
      expect(updatedTodo.updatedAt.epochMilliseconds).toBeGreaterThanOrEqual(
        todo.updatedAt.epochMilliseconds,
      );
    });

    test('元のTodoは変更されない（イミュータブル）', () => {
      const userId = UserId.generate();
      const originalTitle = TodoTitle.from('Original Title');
      const todo = Todo.create(userId, originalTitle);
      const newTitle = TodoTitle.from('New Title');

      todo.changeTitle(newTitle);

      expect(todo.title.equals(originalTitle)).toBe(true);
    });
  });

  describe('changeBody', () => {
    test('本文を変更できる', () => {
      const userId = UserId.generate();
      const todo = Todo.create(userId, TodoTitle.from('My Todo'));
      const newBody = TodoBody.from('New body content');

      const updatedTodo = todo.changeBody(newBody);

      expect(updatedTodo.body.equals(newBody)).toBe(true);
      expect(updatedTodo.id.equals(todo.id)).toBe(true);
      expect(updatedTodo.userId.equals(todo.userId)).toBe(true);
      expect(updatedTodo.title.equals(todo.title)).toBe(true);
      expect(updatedTodo.status).toBe(todo.status);
      expect(updatedTodo.updatedAt.epochMilliseconds).toBeGreaterThanOrEqual(
        todo.updatedAt.epochMilliseconds,
      );
    });

    test('元のTodoは変更されない（イミュータブル）', () => {
      const userId = UserId.generate();
      const todo = Todo.create(userId, TodoTitle.from('My Todo'));
      const originalBody = todo.body;
      const newBody = TodoBody.from('New body content');

      todo.changeBody(newBody);

      expect(todo.body.equals(originalBody)).toBe(true);
    });

    test('空の本文に変更できる', () => {
      const userId = UserId.generate();
      const body = TodoBody.from('Original body');
      const todo = Todo.create(userId, TodoTitle.from('My Todo'), body);

      const updatedTodo = todo.changeBody(TodoBody.empty());

      expect(updatedTodo.body.isEmpty()).toBe(true);
    });
  });

  describe('changeStatus', () => {
    test('ステータスを変更できる', () => {
      const userId = UserId.generate();
      const todo = Todo.create(userId, TodoTitle.from('My Todo'));

      const updatedTodo = todo.changeStatus(TodoStatus.IN_PROGRESS);

      expect(updatedTodo.status).toBe(TodoStatus.IN_PROGRESS);
      expect(updatedTodo.id.equals(todo.id)).toBe(true);
      expect(updatedTodo.userId.equals(todo.userId)).toBe(true);
      expect(updatedTodo.title.equals(todo.title)).toBe(true);
      expect(updatedTodo.body.equals(todo.body)).toBe(true);
      expect(updatedTodo.updatedAt.epochMilliseconds).toBeGreaterThanOrEqual(
        todo.updatedAt.epochMilliseconds,
      );
    });

    test('元のTodoは変更されない（イミュータブル）', () => {
      const userId = UserId.generate();
      const todo = Todo.create(userId, TodoTitle.from('My Todo'));
      const originalStatus = todo.status;

      todo.changeStatus(TodoStatus.COMPLETED);

      expect(todo.status).toBe(originalStatus);
    });

    test('すべてのステータスに変更できる', () => {
      const userId = UserId.generate();
      const todo = Todo.create(userId, TodoTitle.from('My Todo'));

      expect(todo.status).toBe(TodoStatus.NOT_STARTED);

      const inProgress = todo.changeStatus(TodoStatus.IN_PROGRESS);
      expect(inProgress.status).toBe(TodoStatus.IN_PROGRESS);

      const pending = inProgress.changeStatus(TodoStatus.PENDING);
      expect(pending.status).toBe(TodoStatus.PENDING);

      const completed = pending.changeStatus(TodoStatus.COMPLETED);
      expect(completed.status).toBe(TodoStatus.COMPLETED);
    });
  });

  describe('equals', () => {
    test('同じIDのTodoは等価である', () => {
      const id = TodoId.generate();
      const userId = UserId.generate();
      const title = TodoTitle.from('My Todo');
      const body = TodoBody.from('Todo body');
      const now = Temporal.Now.instant();
      const todo1 = Todo.reconstruct(
        id,
        userId,
        title,
        body,
        TodoStatus.NOT_STARTED,
        now,
        now,
      );
      const todo2 = Todo.reconstruct(
        id,
        UserId.generate(),
        TodoTitle.from('Another Todo'),
        TodoBody.empty(),
        TodoStatus.COMPLETED,
        now,
        now,
      );

      expect(todo1.equals(todo2)).toBe(true);
    });

    test('異なるIDのTodoは等価でない', () => {
      const userId = UserId.generate();
      const title = TodoTitle.from('My Todo');
      const todo1 = Todo.create(userId, title);
      const todo2 = Todo.create(userId, title);

      expect(todo1.equals(todo2)).toBe(false);
    });
  });
});
