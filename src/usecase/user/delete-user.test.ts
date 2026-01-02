import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { IUserRepository } from '@/domain/user/repository';
import { UserId } from '@/domain/user/vo/id';
import { getLogger } from '@/infrastructure/logging';
import { DeleteUserUseCase } from './delete-user';

describe('DeleteUserUseCase', () => {
  let useCase: DeleteUserUseCase;
  let mockUserRepository: IUserRepository;
  let logger: ReturnType<typeof getLogger>;

  beforeEach(() => {
    mockUserRepository = {
      find: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
    };
    logger = getLogger('usecase');
    useCase = new DeleteUserUseCase(mockUserRepository, logger);
  });

  describe('execute', () => {
    test('ユーザーが正常に削除される', async () => {
      // Arrange
      const userId = UserId.generate().getValue();
      const param = {
        userId,
      };
      vi.mocked(mockUserRepository.delete).mockResolvedValue(undefined);

      // Act
      await useCase.execute(param);

      // Assert
      expect(mockUserRepository.delete).toHaveBeenCalledWith(
        UserId.from(userId),
      );
      expect(mockUserRepository.delete).toHaveBeenCalledTimes(1);
    });

    test('リポジトリのdeleteでエラーが発生した場合、エラーがthrowされる', async () => {
      // Arrange
      const userId = UserId.generate().getValue();
      const param = {
        userId,
      };
      const repositoryError = new Error('Database error');
      vi.mocked(mockUserRepository.delete).mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(useCase.execute(param)).rejects.toThrow('Database error');
      expect(mockUserRepository.delete).toHaveBeenCalledWith(
        UserId.from(userId),
      );
      expect(mockUserRepository.delete).toHaveBeenCalledTimes(1);
    });
  });
});
