import { BaseId } from '../../shared/vo/id';

/**
 * User ID Value Object
 * ユーザーの一意な識別子
 */
export class UserId extends BaseId {
  private constructor(value: string) {
    super(value);
  }

  /**
   * 新しいUserIDを生成
   */
  static generate(): UserId {
    return new UserId(BaseId.generateUuid());
  }

  /**
   * 既存の値からUserIDを復元
   */
  static from(value: string): UserId {
    return new UserId(value);
  }
}
