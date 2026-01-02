import type { ITodoRepository } from '@/domain/todo/repository';
import { TodoBody } from '@/domain/todo/vo/body';
import { TodoId } from '@/domain/todo/vo/id';
import type { TodoStatus } from '@/domain/todo/vo/status';
import { TodoTitle } from '@/domain/todo/vo/title';
import type { Logger } from '@/infrastructure/logging';
import { buildErrorContext } from '@/infrastructure/logging';

/**
 * Todo更新の入力パラメータ
 */
interface UpdateTodoParam {
  todoId: string;
  title?: string;
  body?: string;
  status?: string;
}

/**
 * Todo更新の出力DTO
 */
interface UpdateTodoDto {
  id: string;
  userId: string;
  title: string;
  body: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Update Todo Use Case Interface
 * Todo更新のユースケースインターフェース
 */
export interface IUpdateTodoUseCase {
  /**
   * Todoを更新する
   * @param param Todo更新のパラメータ
   * @returns 更新されたTodoのDTO
   * @throws Error Todoが見つからない場合、バリデーションエラーまたは永続化エラーが発生した場合
   */
  execute(param: UpdateTodoParam): Promise<UpdateTodoDto>;
}

/**
 * Update Todo Use Case
 * Todo更新のユースケース実装
 */
export class UpdateTodoUseCase implements IUpdateTodoUseCase {
  constructor(
    private readonly todoRepository: ITodoRepository,
    private readonly logger: Logger,
  ) {}

  async execute(param: UpdateTodoParam): Promise<UpdateTodoDto> {
    this.logger.info('Updating todo', {
      todoId: param.todoId,
      title: param.title,
      hasBody: param.body !== undefined,
      status: param.status,
    });

    try {
      // TodoIDをValue Objectに変換
      const todoId = TodoId.from(param.todoId);

      // 既存のTodoを取得
      const existingTodo = await this.todoRepository.find(todoId);
      if (!existingTodo) {
        throw new Error(`Todo not found: ${param.todoId}`);
      }

      // 変更を適用（不変性の原則により、新しいインスタンスを返す）
      let updatedTodo = existingTodo;
      if (param.title !== undefined) {
        updatedTodo = updatedTodo.changeTitle(TodoTitle.from(param.title));
      }
      if (param.body !== undefined) {
        updatedTodo = updatedTodo.changeBody(
          param.body === '' ? TodoBody.empty() : TodoBody.from(param.body),
        );
      }
      if (param.status !== undefined) {
        updatedTodo = updatedTodo.changeStatus(param.status as TodoStatus);
      }

      // Todoを永続化
      await this.todoRepository.save(updatedTodo);

      this.logger.info('Todo updated', {
        todoId: updatedTodo.id.getValue(),
        userId: updatedTodo.userId.getValue(),
        title: updatedTodo.title.getValue(),
      });

      // Value Objectからプリミティブ型に変換してDTOを返す
      return {
        id: updatedTodo.id.getValue(),
        userId: updatedTodo.userId.getValue(),
        title: updatedTodo.title.getValue(),
        body: updatedTodo.body.getValue(),
        status: updatedTodo.status,
        createdAt: new Date(updatedTodo.createdAt.epochMilliseconds),
        updatedAt: new Date(updatedTodo.updatedAt.epochMilliseconds),
      };
    } catch (error) {
      this.logger.error('Failed to update todo', {
        todoId: param.todoId,
        title: param.title,
        status: param.status,
        ...buildErrorContext(error),
      });
      throw error;
    }
  }
}
