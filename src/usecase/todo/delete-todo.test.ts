import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { ITodoRepository } from '@/domain/todo/repository';
import { TodoId } from '@/domain/todo/vo/id';
import { getLogger } from '@/infrastructure/logging';
import { DeleteTodoUseCase } from './delete-todo';

describe('DeleteTodoUseCase', () => {
  let useCase: DeleteTodoUseCase;
  let mockTodoRepository: ITodoRepository;
  let logger: ReturnType<typeof getLogger>;

  beforeEach(() => {
    mockTodoRepository = {
      find: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
    };
    logger = getLogger('usecase');
    useCase = new DeleteTodoUseCase(mockTodoRepository, logger);
  });

  describe('execute', () => {
    test('Todoが正常に削除される', async () => {
      // Arrange
      const todoId = TodoId.generate().getValue();
      const param = {
        todoId,
      };
      vi.mocked(mockTodoRepository.delete).mockResolvedValue(undefined);

      // Act
      await useCase.execute(param);

      // Assert
      expect(mockTodoRepository.delete).toHaveBeenCalledWith(
        TodoId.from(todoId),
      );
      expect(mockTodoRepository.delete).toHaveBeenCalledTimes(1);
    });

    test('リポジトリのdeleteでエラーが発生した場合、エラーがthrowされる', async () => {
      // Arrange
      const todoId = TodoId.generate().getValue();
      const param = {
        todoId,
      };
      const repositoryError = new Error('Database error');
      vi.mocked(mockTodoRepository.delete).mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(useCase.execute(param)).rejects.toThrow('Database error');
      expect(mockTodoRepository.delete).toHaveBeenCalledWith(
        TodoId.from(todoId),
      );
      expect(mockTodoRepository.delete).toHaveBeenCalledTimes(1);
    });
  });
});
