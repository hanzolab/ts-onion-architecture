import type { IUserRepository } from '@/domain/user/repository';
import { Email } from '@/domain/user/vo/email';
import { UserId } from '@/domain/user/vo/id';
import { Username } from '@/domain/user/vo/username';
import type { Logger } from '@/infrastructure/logging';
import { buildErrorContext } from '@/infrastructure/logging';

/**
 * ユーザー更新の入力パラメータ
 */
interface UpdateUserParam {
  userId: string;
  email?: string;
  name?: string;
}

/**
 * ユーザー更新の出力DTO
 */
interface UpdateUserDto {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Update User Use Case Interface
 * ユーザー更新のユースケースインターフェース
 */
export interface IUpdateUserUseCase {
  /**
   * ユーザーを更新する
   * @param param ユーザー更新のパラメータ
   * @returns 更新されたユーザーのDTO
   * @throws Error ユーザーが見つからない場合、バリデーションエラーまたは永続化エラーが発生した場合
   */
  execute(param: UpdateUserParam): Promise<UpdateUserDto>;
}

/**
 * Update User Use Case
 * ユーザー更新のユースケース実装
 */
export class UpdateUserUseCase implements IUpdateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly logger: Logger,
  ) {}

  async execute(param: UpdateUserParam): Promise<UpdateUserDto> {
    this.logger.info('Updating user', {
      userId: param.userId,
      email: param.email,
      name: param.name,
    });

    try {
      // ユーザーIDをValue Objectに変換
      const userId = UserId.from(param.userId);

      // 既存のユーザーを取得
      const existingUser = await this.userRepository.find(userId);
      if (!existingUser) {
        throw new Error(`User not found: ${param.userId}`);
      }

      // 変更を適用（不変性の原則により、新しいインスタンスを返す）
      let updatedUser = existingUser;
      if (param.email !== undefined) {
        updatedUser = updatedUser.changeEmail(Email.from(param.email));
      }
      if (param.name !== undefined) {
        updatedUser = updatedUser.changeName(Username.from(param.name));
      }

      // ユーザーを永続化
      await this.userRepository.save(updatedUser);

      this.logger.info('User updated', {
        userId: updatedUser.id.getValue(),
        email: updatedUser.email.getValue(),
      });

      // Value Objectからプリミティブ型に変換してDTOを返す
      return {
        id: updatedUser.id.getValue(),
        email: updatedUser.email.getValue(),
        name: updatedUser.name.getValue(),
        createdAt: new Date(updatedUser.createdAt.epochMilliseconds),
        updatedAt: new Date(updatedUser.updatedAt.epochMilliseconds),
      };
    } catch (error) {
      this.logger.error('Failed to update user', {
        userId: param.userId,
        email: param.email,
        name: param.name,
        ...buildErrorContext(error),
      });
      throw error;
    }
  }
}
