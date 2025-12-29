import { Temporal } from '@js-temporal/polyfill';
import type { UserId } from '../user/vo/id';
import { TodoBody } from './vo/body';
import { TodoId } from './vo/id';
import { TodoStatus } from './vo/status';
import type { TodoTitle } from './vo/title';

/**
 * Todo Entity
 * Todoを表現するエンティティ
 */
export class Todo {
  private constructor(
    private readonly _id: TodoId,
    private readonly _userId: UserId,
    private readonly _title: TodoTitle,
    private readonly _body: TodoBody,
    private readonly _status: TodoStatus,
    private readonly _createdAt: Temporal.Instant,
    private readonly _updatedAt: Temporal.Instant,
  ) {}

  /**
   * 新しいTodoを作成
   */
  static create(userId: UserId, title: TodoTitle, body?: TodoBody): Todo {
    const now = Temporal.Now.instant();
    return new Todo(
      TodoId.generate(),
      userId,
      title,
      body ?? TodoBody.empty(),
      TodoStatus.NOT_STARTED,
      now,
      now,
    );
  }

  /**
   * 既存のTodoを復元
   */
  static reconstruct(
    id: TodoId,
    userId: UserId,
    title: TodoTitle,
    body: TodoBody,
    status: TodoStatus,
    createdAt: Temporal.Instant,
    updatedAt: Temporal.Instant,
  ): Todo {
    return new Todo(id, userId, title, body, status, createdAt, updatedAt);
  }

  /**
   * TodoIDを取得
   */
  get id(): TodoId {
    return this._id;
  }

  /**
   * ユーザーIDを取得
   */
  get userId(): UserId {
    return this._userId;
  }

  /**
   * タイトルを取得
   */
  get title(): TodoTitle {
    return this._title;
  }

  /**
   * 本文を取得
   */
  get body(): TodoBody {
    return this._body;
  }

  /**
   * ステータスを取得
   */
  get status(): TodoStatus {
    return this._status;
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
   * タイトルを変更した新しいTodoを返す
   */
  changeTitle(title: TodoTitle): Todo {
    return new Todo(
      this._id,
      this._userId,
      title,
      this._body,
      this._status,
      this._createdAt,
      Temporal.Now.instant(),
    );
  }

  /**
   * 本文を変更した新しいTodoを返す
   */
  changeBody(body: TodoBody): Todo {
    return new Todo(
      this._id,
      this._userId,
      this._title,
      body,
      this._status,
      this._createdAt,
      Temporal.Now.instant(),
    );
  }

  /**
   * ステータスを変更した新しいTodoを返す
   */
  changeStatus(status: TodoStatus): Todo {
    return new Todo(
      this._id,
      this._userId,
      this._title,
      this._body,
      status,
      this._createdAt,
      Temporal.Now.instant(),
    );
  }

  /**
   * エンティティの等価性を比較（IDで比較）
   */
  equals(other: Todo): boolean {
    return this._id.equals(other._id);
  }
}
