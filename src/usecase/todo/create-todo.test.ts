import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { ITodoRepository } from '@/domain/todo/repository';
import { UserId } from '@/domain/user/vo/id';
import { getLogger } from '@/infrastructure/logging';
import { CreateTodoUseCase } from './create-todo';

describe('CreateTodoUseCase', () => {
  let useCase: CreateTodoUseCase;
  let mockTodoRepository: ITodoRepository;
  let logger: ReturnType<typeof getLogger>;

  beforeEach(() => {
    mockTodoRepository = {
      find: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
    };
    logger = getLogger('usecase');
    useCase = new CreateTodoUseCase(mockTodoRepository, logger);
  });

  describe('execute', () => {
    test('bodyなしでTodoが正常に作成される', async () => {
      // Arrange
      const userId = UserId.generate().getValue();
      const param = {
        userId,
        title: 'Test Todo',
      };
      vi.mocked(mockTodoRepository.save).mockResolvedValue(undefined);

      // Act
      const result = await useCase.execute(param);

      // Assert
      expect(result.id).toBeDefined();
      expect(result.userId).toBe(userId);
      expect(result.title).toBe(param.title);
      expect(result.body).toBe('');
      expect(result.status).toBe('NOT_STARTED');
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(mockTodoRepository.save).toHaveBeenCalledTimes(1);
    });

    test('bodyありでTodoが正常に作成される', async () => {
      // Arrange
      const userId = UserId.generate().getValue();
      const param = {
        userId,
        title: 'Test Todo',
        body: 'This is a test body',
      };
      vi.mocked(mockTodoRepository.save).mockResolvedValue(undefined);

      // Act
      const result = await useCase.execute(param);

      // Assert
      expect(result.id).toBeDefined();
      expect(result.userId).toBe(userId);
      expect(result.title).toBe(param.title);
      expect(result.body).toBe(param.body);
      expect(result.status).toBe('NOT_STARTED');
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(mockTodoRepository.save).toHaveBeenCalledTimes(1);
    });

    test('無効なtitleでバリデーションエラーが発生する', async () => {
      // Arrange
      const userId = UserId.generate().getValue();
      const param = {
        userId,
        title: '', // 空文字列
      };

      // Act & Assert
      await expect(useCase.execute(param)).rejects.toThrow();
      expect(mockTodoRepository.save).not.toHaveBeenCalled();
    });

    test('無効なbodyでバリデーションエラーが発生する', async () => {
      // Arrange
      const userId = UserId.generate().getValue();
      const param = {
        userId,
        title: 'Test Todo',
        body: 'a'.repeat(1001), // 1000文字を超える
      };

      // Act & Assert
      await expect(useCase.execute(param)).rejects.toThrow();
      expect(mockTodoRepository.save).not.toHaveBeenCalled();
    });

    test('リポジトリのsaveでエラーが発生した場合、エラーがthrowされる', async () => {
      // Arrange
      const userId = UserId.generate().getValue();
      const param = {
        userId,
        title: 'Test Todo',
      };
      const repositoryError = new Error('Database error');
      vi.mocked(mockTodoRepository.save).mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(useCase.execute(param)).rejects.toThrow('Database error');
      expect(mockTodoRepository.save).toHaveBeenCalledTimes(1);
    });
  });
});
