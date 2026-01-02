import type { IUserRepository } from '@/domain/user/repository';
import { UserId } from '@/domain/user/vo/id';
import type { Logger } from '@/infrastructure/logging';
import { buildErrorContext } from '@/infrastructure/logging';

/**
 * ユーザー削除の入力パラメータ
 */
interface DeleteUserParam {
  userId: string;
}

/**
 * Delete User Use Case Interface
 * ユーザー削除のユースケースインターフェース
 */
export interface IDeleteUserUseCase {
  /**
   * ユーザーを削除する
   * @param param ユーザー削除のパラメータ
   * @throws Error ユーザーが見つからない場合または永続化エラーが発生した場合
   */
  execute(param: DeleteUserParam): Promise<void>;
}

/**
 * Delete User Use Case
 * ユーザー削除のユースケース実装
 */
export class DeleteUserUseCase implements IDeleteUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly logger: Logger,
  ) {}

  async execute(param: DeleteUserParam): Promise<void> {
    this.logger.info('Deleting user', {
      userId: param.userId,
    });

    try {
      // ユーザーIDをValue Objectに変換
      const userId = UserId.from(param.userId);

      // ユーザーを削除
      await this.userRepository.delete(userId);

      this.logger.info('User deleted', {
        userId: param.userId,
      });
    } catch (error) {
      this.logger.error('Failed to delete user', {
        userId: param.userId,
        ...buildErrorContext(error),
      });
      throw error;
    }
  }
}
