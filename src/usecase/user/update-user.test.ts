import { Temporal } from '@js-temporal/polyfill';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { User } from '@/domain/user/entity';
import type { IUserRepository } from '@/domain/user/repository';
import { Email } from '@/domain/user/vo/email';
import { UserId } from '@/domain/user/vo/id';
import { Username } from '@/domain/user/vo/username';
import { getLogger } from '@/infrastructure/logging';
import { UpdateUserUseCase } from './update-user';

describe('UpdateUserUseCase', () => {
  let useCase: UpdateUserUseCase;
  let mockUserRepository: IUserRepository;
  let logger: ReturnType<typeof getLogger>;

  beforeEach(() => {
    mockUserRepository = {
      find: vi.fn(),
      save: vi.fn(),
      delete: vi.fn(),
    };
    logger = getLogger('usecase');
    useCase = new UpdateUserUseCase(mockUserRepository, logger);
  });

  describe('execute', () => {
    test('emailのみ更新できる', async () => {
      // Arrange
      const existingUser = User.create(
        Email.from('old@example.com'),
        Username.from('TestUser'),
      );
      const userId = existingUser.id.getValue();
      const param = {
        userId,
        email: 'new@example.com',
      };
      vi.mocked(mockUserRepository.find).mockResolvedValue(existingUser);
      vi.mocked(mockUserRepository.save).mockResolvedValue(undefined);

      // Act
      const result = await useCase.execute(param);

      // Assert
      expect(result.id).toBe(userId);
      expect(result.email).toBe(param.email);
      expect(result.name).toBe(existingUser.name.getValue());
      expect(mockUserRepository.find).toHaveBeenCalledWith(existingUser.id);
      expect(mockUserRepository.save).toHaveBeenCalledTimes(1);
    });

    test('nameのみ更新できる', async () => {
      // Arrange
      const existingUser = User.create(
        Email.from('test@example.com'),
        Username.from('OldName'),
      );
      const userId = existingUser.id.getValue();
      const param = {
        userId,
        name: 'NewName',
      };
      vi.mocked(mockUserRepository.find).mockResolvedValue(existingUser);
      vi.mocked(mockUserRepository.save).mockResolvedValue(undefined);

      // Act
      const result = await useCase.execute(param);

      // Assert
      expect(result.id).toBe(userId);
      expect(result.email).toBe(existingUser.email.getValue());
      expect(result.name).toBe(param.name);
      expect(mockUserRepository.find).toHaveBeenCalledWith(existingUser.id);
      expect(mockUserRepository.save).toHaveBeenCalledTimes(1);
    });

    test('emailとnameの両方を更新できる', async () => {
      // Arrange
      const existingUser = User.create(
        Email.from('old@example.com'),
        Username.from('OldName'),
      );
      const userId = existingUser.id.getValue();
      const param = {
        userId,
        email: 'new@example.com',
        name: 'NewName',
      };
      vi.mocked(mockUserRepository.find).mockResolvedValue(existingUser);
      vi.mocked(mockUserRepository.save).mockResolvedValue(undefined);

      // Act
      const result = await useCase.execute(param);

      // Assert
      expect(result.id).toBe(userId);
      expect(result.email).toBe(param.email);
      expect(result.name).toBe(param.name);
      expect(mockUserRepository.find).toHaveBeenCalledWith(existingUser.id);
      expect(mockUserRepository.save).toHaveBeenCalledTimes(1);
    });

    test('ユーザーが見つからない場合、エラーがthrowされる', async () => {
      // Arrange
      const userId = UserId.generate().getValue();
      const param = {
        userId,
        email: 'new@example.com',
      };
      vi.mocked(mockUserRepository.find).mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(param)).rejects.toThrow(
        `User not found: ${userId}`,
      );
      expect(mockUserRepository.find).toHaveBeenCalledWith(UserId.from(userId));
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    test('無効なemailでバリデーションエラーが発生する', async () => {
      // Arrange
      const existingUser = User.create(
        Email.from('test@example.com'),
        Username.from('TestUser'),
      );
      const userId = existingUser.id.getValue();
      const param = {
        userId,
        email: 'invalid-email',
      };
      vi.mocked(mockUserRepository.find).mockResolvedValue(existingUser);

      // Act & Assert
      await expect(useCase.execute(param)).rejects.toThrow();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    test('無効なnameでバリデーションエラーが発生する', async () => {
      // Arrange
      const existingUser = User.create(
        Email.from('test@example.com'),
        Username.from('TestUser'),
      );
      const userId = existingUser.id.getValue();
      const param = {
        userId,
        name: 'ab', // 3文字未満
      };
      vi.mocked(mockUserRepository.find).mockResolvedValue(existingUser);

      // Act & Assert
      await expect(useCase.execute(param)).rejects.toThrow();
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    test('リポジトリのsaveでエラーが発生した場合、エラーがthrowされる', async () => {
      // Arrange
      const existingUser = User.create(
        Email.from('test@example.com'),
        Username.from('TestUser'),
      );
      const userId = existingUser.id.getValue();
      const param = {
        userId,
        email: 'new@example.com',
      };
      const repositoryError = new Error('Database error');
      vi.mocked(mockUserRepository.find).mockResolvedValue(existingUser);
      vi.mocked(mockUserRepository.save).mockRejectedValue(repositoryError);

      // Act & Assert
      await expect(useCase.execute(param)).rejects.toThrow('Database error');
      expect(mockUserRepository.save).toHaveBeenCalledTimes(1);
    });
  });
});
