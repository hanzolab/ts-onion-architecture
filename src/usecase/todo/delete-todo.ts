import type { ITodoRepository } from '@/domain/todo/repository';
import { TodoId } from '@/domain/todo/vo/id';
import type { Logger } from '@/infrastructure/logging';
import { buildErrorContext } from '@/infrastructure/logging';

/**
 * Todo削除の入力パラメータ
 */
interface DeleteTodoParam {
  todoId: string;
}

/**
 * Delete Todo Use Case Interface
 * Todo削除のユースケースインターフェース
 */
export interface IDeleteTodoUseCase {
  /**
   * Todoを削除する
   * @param param Todo削除のパラメータ
   * @throws Error Todoが見つからない場合または永続化エラーが発生した場合
   */
  execute(param: DeleteTodoParam): Promise<void>;
}

/**
 * Delete Todo Use Case
 * Todo削除のユースケース実装
 */
export class DeleteTodoUseCase implements IDeleteTodoUseCase {
  constructor(
    private readonly todoRepository: ITodoRepository,
    private readonly logger: Logger,
  ) {}

  async execute(param: DeleteTodoParam): Promise<void> {
    this.logger.info('Deleting todo', {
      todoId: param.todoId,
    });

    try {
      // TodoIDをValue Objectに変換
      const todoId = TodoId.from(param.todoId);

      // Todoを削除
      await this.todoRepository.delete(todoId);

      this.logger.info('Todo deleted', {
        todoId: param.todoId,
      });
    } catch (error) {
      this.logger.error('Failed to delete todo', {
        todoId: param.todoId,
        ...buildErrorContext(error),
      });
      throw error;
    }
  }
}
