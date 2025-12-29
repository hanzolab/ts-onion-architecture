import { Temporal } from '@js-temporal/polyfill';
import type { Email } from './vo/email';
import { UserId } from './vo/id';
import type { Username } from './vo/username';

/**
 * User Entity
 * ユーザーを表現するエンティティ
 */
export class User {
  private constructor(
    private readonly _id: UserId,
    private readonly _email: Email,
    private readonly _name: Username,
    private readonly _createdAt: Temporal.Instant,
    private readonly _updatedAt: Temporal.Instant,
  ) {}

  /**
   * 新しいユーザーを作成
   */
  static create(email: Email, name: Username): User {
    const now = Temporal.Now.instant();
    return new User(UserId.generate(), email, name, now, now);
  }

  /**
   * 既存のユーザーを復元
   */
  static reconstruct(
    id: UserId,
    email: Email,
    name: Username,
    createdAt: Temporal.Instant,
    updatedAt: Temporal.Instant,
  ): User {
    return new User(id, email, name, createdAt, updatedAt);
  }

  /**
   * ユーザーIDを取得
   */
  get id(): UserId {
    return this._id;
  }

  /**
   * メールアドレスを取得
   */
  get email(): Email {
    return this._email;
  }

  /**
   * 名前を取得
   */
  get name(): Username {
    return this._name;
  }

  /**
   * 作成日時を取得
   */
  get createdAt(): Temporal.Instant {
    return this._createdAt;
  }

  /**
   * 更新日時を取得
   */
  get updatedAt(): Temporal.Instant {
    return this._updatedAt;
  }

  /**
   * メールアドレスを変更した新しいユーザーを返す
   */
  changeEmail(email: Email): User {
    return new User(
      this._id,
      email,
      this._name,
      this._createdAt,
      Temporal.Now.instant(),
    );
  }

  /**
   * 名前を変更した新しいユーザーを返す
   */
  changeName(name: Username): User {
    return new User(
      this._id,
      this._email,
      name,
      this._createdAt,
      Temporal.Now.instant(),
    );
  }

  /**
   * エンティティの等価性を比較（IDで比較）
   */
  equals(other: User): boolean {
    return this._id.equals(other._id);
  }
}
