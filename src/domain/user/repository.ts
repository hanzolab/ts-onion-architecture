import type { User } from './entity';
import type { UserId } from './vo/id';

/**
 * User Repository Interface
 * ユーザーの永続化を担当するリポジトリのインターフェース
 */
export interface IUserRepository {
  /**
   * IDでユーザーを検索する
   * @param id ユーザーID
   * @returns 見つかったユーザー、存在しない場合はnull
   */
  find(id: UserId): Promise<User | null>;

  /**
   * ユーザーを保存する（新規作成または更新）
   * @param user 保存するユーザー
   */
  save(user: User): Promise<void>;

  /**
   * ユーザーを削除する
   * @param id ユーザーID
   */
  delete(id: UserId): Promise<void>;
}
