import { BaseId } from '../../shared/vo/id';

/**
 * Todo ID Value Object
 * Todoの一意な識別子
 */
export class TodoId extends BaseId {
  private constructor(value: string) {
    super(value);
  }

  /**
   * 新しいTodoIDを生成
   */
  static generate(): TodoId {
    return new TodoId(BaseId.generateUuid());
  }

  /**
   * 既存の値からTodoIDを復元
   */
  static from(value: string): TodoId {
    return new TodoId(value);
  }
}
