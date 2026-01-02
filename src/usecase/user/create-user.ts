import { User } from '@/domain/user/entity';
import type { IUserRepository } from '@/domain/user/repository';
import { Email } from '@/domain/user/vo/email';
import { Username } from '@/domain/user/vo/username';
import type { Logger } from '@/infrastructure/logging';
import { buildErrorContext } from '@/infrastructure/logging';

/**
 * ユーザー作成の入力パラメータ
 */
interface CreateUserParam {
  email: string;
  name: string;
}

/**
 * ユーザー作成の出力DTO
 */
interface CreateUserDto {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create User Use Case Interface
 * ユーザー作成のユースケースインターフェース
 */
export interface ICreateUserUseCase {
  /**
   * ユーザーを作成する
   * @param param ユーザー作成のパラメータ
   * @returns 作成されたユーザーのDTO
   * @throws Error バリデーションエラーまたは永続化エラーが発生した場合
   */
  execute(param: CreateUserParam): Promise<CreateUserDto>;
}

/**
 * Create User Use Case
 * ユーザー作成のユースケース実装
 */
export class CreateUserUseCase implements ICreateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly logger: Logger,
  ) {}

  async execute(param: CreateUserParam): Promise<CreateUserDto> {
    this.logger.info('Creating user', {
      email: param.email,
      name: param.name,
    });

    try {
      // プリミティブ型からValue Objectに変換してユーザーを作成
      const user = User.create(
        Email.from(param.email),
        Username.from(param.name),
      );

      // ユーザーを永続化
      await this.userRepository.save(user);

      this.logger.info('User created', {
        userId: user.id.getValue(),
        email: user.email.getValue(),
      });

      // Value Objectからプリミティブ型に変換してDTOを返す
      return {
        id: user.id.getValue(),
        email: user.email.getValue(),
        name: user.name.getValue(),
        createdAt: new Date(user.createdAt.epochMilliseconds),
        updatedAt: new Date(user.updatedAt.epochMilliseconds),
      };
    } catch (error) {
      this.logger.error('Failed to create user', {
        email: param.email,
        name: param.name,
        ...buildErrorContext(error),
      });
      throw error;
    }
  }
}
