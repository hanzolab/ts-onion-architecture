import { Temporal } from '@js-temporal/polyfill';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { Todo } from '@/domain/todo/entity';
import type { ITodoRepository } from '@/domain/todo/repository';
import { TodoBody } from '@/domain/todo/vo/body';
import { TodoId } from '@/domain/todo/vo/id';
import { TodoStatus } from '@/domain/todo/vo/status';
import { TodoTitle } from '@/domain/todo/vo/title';
import { UserId } from '@/domain/user/vo/id';
import { getLogger } from '@/infrastructure/logging';
import { UpdateTodoUseCase } from './update-todo';

describe('UpdateTodoUseCase', () => {
  let useCase: UpdateTodoUseCase;
  let mockTodoRepository: ITodoRepository;
  let logger: ReturnType<typeof getLogger>;

  beforeEach(() => {
    mockTodoRepository = {
      find: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
    };
    logger = getLogger('usecase');
    useCase = new UpdateTodoUseCase(mockTodoRepository, logger);
  });

  describe('execute', () => {
    test('titleのみ更新できる', async () => {
      // Arrange
      const userId = UserId.generate();
      const existingTodo = Todo.create(userId, TodoTitle.from('Old Title'));
      const todoId = existingTodo.id.getValue();
      const param = {
        todoId,
        title: 'New Title',
      };
      vi.mocked(mockTodoRepository.find).mockResolvedValue(existingTodo);
      vi.mocked(mockTodoRepository.save).mockResolvedValue(undefined);

      // Act
      const result = await useCase.execute(param);

      // Assert
      expect(result.id).toBe(todoId);
      expect(result.title).toBe(param.title);
      expect(result.body).toBe(existingTodo.body.getValue());
      expect(result.status).toBe(existingTodo.status);
      expect(mockTodoRepository.find).toHaveBeenCalledWith(existingTodo.id);
      expect(mockTodoRepository.save).toHaveBeenCalledTimes(1);
    });

    test('bodyのみ更新できる', async () => {
      // Arrange
      const userId = UserId.generate();
      const existingTodo = Todo.create(
        userId,
        TodoTitle.from('Test Todo'),
        TodoBody.from('Old Body'),
      );
      const todoId = existingTodo.id.getValue();
      const param = {
        todoId,
        body: 'New Body',
      };
      vi.mocked(mockTodoRepository.find).mockResolvedValue(existingTodo);
      vi.mocked(mockTodoRepository.save).mockResolvedValue(undefined);

      // Act
      const result = await useCase.execute(param);

      // Assert
      expect(result.id).toBe(todoId);
      expect(result.title).toBe(existingTodo.title.getValue());
      expect(result.body).toBe(param.body);
      expect(result.status).toBe(existingTodo.status);
      expect(mockTodoRepository.find).toHaveBeenCalledWith(existingTodo.id);
      expect(mockTodoRepository.save).toHaveBeenCalledTimes(1);
    });

    test('空文字列でbodyを更新できる', async () => {
      // Arrange
      const userId = UserId.generate();
      const existingTodo = Todo.create(
        userId,
        TodoTitle.from('Test Todo'),
        TodoBody.from('Old Body'),
      );
      const todoId = existingTodo.id.getValue();
      const param = {
        todoId,
        body: '',
      };
      vi.mocked(mockTodoRepository.find).mockResolvedValue(existingTodo);
      vi.mocked(mockTodoRepository.save).mockResolvedValue(undefined);

      // Act
      const result = await useCase.execute(param);

      // Assert
      expect(result.id).toBe(todoId);
      expect(result.body).toBe('');
      expect(mockTodoRepository.save).toHaveBeenCalledTimes(1);
    });

    test('statusのみ更新できる', async () => {
      // Arrange
      const userId = UserId.generate();
      const existingTodo = Todo.create(userId, TodoTitle.from('Test Todo'));
      const todoId = existingTodo.id.getValue();
      const param = {
        todoId,
        status: 'IN_PROGRESS',
      };
      vi.mocked(mockTodoRepository.find).mockResolvedValue(existingTodo);
      vi.mocked(mockTodoRepository.save).mockResolvedValue(undefined);

      // Act
      const result = await useCase.execute(param);

      // Assert
      expect(result.id).toBe(todoId);
      expect(result.title).toBe(existingTodo.title.getValue());
      expect(result.status).toBe(param.status);
      expect(mockTodoRepository.find).toHaveBeenCalledWith(existingTodo.id);
      expect(mockTodoRepository.save).toHaveBeenCalledTimes(1);
    });

    test('複数フィールドを更新できる', async () => {
      // Arrange
      const userId = UserId.generate();
      const existingTodo = Todo.create(
        userId,
        TodoTitle.from('Old Title'),
        TodoBody.from('Old Body'),
      );
      const todoId = existingTodo.id.getValue();
      const param = {
        todoId,
        title: 'New Title',
        body: 'New Body',
        status: 'COMPLETED',
      };
      vi.mocked(mockTodoRepository.find).mockResolvedValue(existingTodo);
      vi.mocked(mockTodoRepository.save).mockResolvedValue(undefined);

      // Act
      const result = await useCase.execute(param);

      // Assert
      expect(result.id).toBe(todoId);
      expect(result.title).toBe(param.title);
      expect(result.body).toBe(param.body);
      expect(result.status).toBe(param.status);
      expect(mockTodoRepository.find).toHaveBeenCalledWith(existingTodo.id);
      expect(mockTodoRepository.save).toHaveBeenCalledTimes(1);
    });

    test('Todoが見つからない場合、エラーがthrowされる', async () => {
      // Arrange
      const todoId = TodoId.generate().getValue();
      const param = {
        todoId,
        title: 'New Title',
      };
      vi.mocked(mockTodoRepository.find).mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(param)).rejects.toThrow(
        `Todo not found: ${todoId}`,
      );
      expect(mockTodoRepository.find).toHaveBeenCalledWith(TodoId.from(todoId));
      expect(mockTodoRepository.save).not.toHaveBeenCalled();
    });

    test('無効なtitleでバリデーションエラーが発生する', async () => {
      // Arrange
      const userId = UserId.generate();
      const existingTodo = Todo.create(userId, TodoTitle.from('Test Todo'));
      const todoId = existingTodo.id.getValue();
      const param = {
        todoId,
        title: '', // 空文字列
      };
      vi.mocked(mockTodoRepository.find).mockResolvedValue(existingTodo);

      // Act & Assert
      await expect(useCase.execute(param)).rejects.toThrow();
      expect(mockTodoRepository.save).not.toHaveBeenCalled();
    });

    test('無効なbodyでバリデーションエラーが発生する', async () => {
      // Arrange
      const userId = UserId.generate();
      const existingTodo = Todo.create(userId, TodoTitle.from('Test Todo'));
      const todoId = existingTodo.id.getValue();
      const param = {
        todoId,
        body: 'a'.repeat(1001), // 1000文字を超える
      };
      vi.mocked(mockTodoRepository.find).mockResolvedValue(existingTodo);

      // Act & Assert
      await expect(useCase.execute(param)).rejects.toThrow();
      expect(mockTodoRepository.save).not.toHaveBeenCalled();
    });

    test('リポジトリのsaveでエラーが発生した場合、エラーがthrowされる', async () => {
      // Arrange
      const userId = UserId.generate();
      const existingTodo = Todo.create(userId, TodoTitle.from('Test Todo'));
      const todoId = existingTodo.id.getValue();
      const param = {
        todoId,
        title: 'New Title',
      };
      const repositoryError = new Error('Database error');
      vi.mocked(mockTodoRepository.find).mockResolvedValue(existingTodo);
      vi.mocked(mockTodoRepository.save).mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(useCase.execute(param)).rejects.toThrow('Database error');
      expect(mockTodoRepository.save).toHaveBeenCalledTimes(1);
    });
  });
});
