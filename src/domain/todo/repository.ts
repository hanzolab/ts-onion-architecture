import type { Todo } from './entity';
import type { TodoId } from './vo/id';

/**
 * Todo Repository Interface
 * Todoの永続化を担当するリポジトリのインターフェース
 */
export interface ITodoRepository {
  /**
   * IDでTodoを検索する
   * @param id ユーザーID
   * @returns 見つかったTodo、存在しない場合はnull
   */
  find(id: TodoId): Promise<Todo | null>;

  /**
   * Todoを保存する（新規作成または更新）
   * @param todo 保存するTodo
   */
  save(todo: Todo): Promise<void>;

  /**
   * Todoを削除する
   * @param id TodoID
   */
  delete(id: TodoId): Promise<void>;
}
