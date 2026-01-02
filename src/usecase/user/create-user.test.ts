import { beforeEach, describe, expect, test, vi } from 'vitest';
import { User } from '@/domain/user/entity';
import type { IUserRepository } from '@/domain/user/repository';
import { Email } from '@/domain/user/vo/email';
import { UserId } from '@/domain/user/vo/id';
import { Username } from '@/domain/user/vo/username';
import { getLogger } from '@/infrastructure/logging';
import { CreateUserUseCase } from './create-user';

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let mockUserRepository: IUserRepository;
  let logger: ReturnType<typeof getLogger>;

  beforeEach(() => {
    mockUserRepository = {
      find: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
    };
    logger = getLogger('usecase');
    useCase = new CreateUserUseCase(mockUserRepository, logger);
  });

  describe('execute', () => {
    test('ユーザーが正常に作成される', async () => {
      // Arrange
      const param = {
        email: 'test@example.com',
        name: 'TestUser',
      };
      vi.mocked(mockUserRepository.save).mockResolvedValue(undefined);

      // Act
      const result = await useCase.execute(param);

      // Assert
      expect(result.id).toBeDefined();
      expect(result.email).toBe(param.email);
      expect(result.name).toBe(param.name);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(mockUserRepository.save).toHaveBeenCalledTimes(1);
    });

    test('無効なemailでバリデーションエラーが発生する', async () => {
      // Arrange
      const param = {
        email: 'invalid-email',
        name: 'TestUser',
      };

      // Act & Assert
      await expect(useCase.execute(param)).rejects.toThrow();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    test('無効なnameでバリデーションエラーが発生する', async () => {
      // Arrange
      const param = {
        email: 'test@example.com',
        name: 'ab', // 3文字未満
      };

      // Act & Assert
      await expect(useCase.execute(param)).rejects.toThrow();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    test('リポジトリのsaveでエラーが発生した場合、エラーがthrowされる', async () => {
      // Arrange
      const param = {
        email: 'test@example.com',
        name: 'TestUser',
      };
      const repositoryError = new Error('Database error');
      vi.mocked(mockUserRepository.save).mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(useCase.execute(param)).rejects.toThrow('Database error');
      expect(mockUserRepository.save).toHaveBeenCalledTimes(1);
    });
  });
});
