import { Todo } from '@/domain/todo/entity';
import type { ITodoRepository } from '@/domain/todo/repository';
import { TodoBody } from '@/domain/todo/vo/body';
import { TodoTitle } from '@/domain/todo/vo/title';
import { UserId } from '@/domain/user/vo/id';
import type { Logger } from '@/infrastructure/logging';
import { buildErrorContext } from '@/infrastructure/logging';

/**
 * Todo作成の入力パラメータ
 */
interface CreateTodoParam {
  userId: string;
  title: string;
  body?: string;
}

/**
 * Todo作成の出力DTO
 */
interface CreateTodoDto {
  id: string;
  userId: string;
  title: string;
  body: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create Todo Use Case Interface
 * Todo作成のユースケースインターフェース
 */
export interface ICreateTodoUseCase {
  /**
   * Todoを作成する
   * @param param Todo作成のパラメータ
   * @returns 作成されたTodoのDTO
   * @throws Error バリデーションエラーまたは永続化エラーが発生した場合
   */
  execute(param: CreateTodoParam): Promise<CreateTodoDto>;
}

/**
 * Create Todo Use Case
 * Todo作成のユースケース実装
 */
export class CreateTodoUseCase implements ICreateTodoUseCase {
  constructor(
    private readonly todoRepository: ITodoRepository,
    private readonly logger: Logger,
  ) {}

  async execute(param: CreateTodoParam): Promise<CreateTodoDto> {
    this.logger.info('Creating todo', {
      userId: param.userId,
      title: param.title,
      hasBody: param.body !== undefined,
    });

    try {
      // プリミティブ型からValue Objectに変換してTodoを作成
      const todo = Todo.create(
        UserId.from(param.userId),
        TodoTitle.from(param.title),
        param.body !== undefined ? TodoBody.from(param.body) : undefined,
      );

      // Todoを永続化
      await this.todoRepository.save(todo);

      this.logger.info('Todo created', {
        todoId: todo.id.getValue(),
        userId: todo.userId.getValue(),
        title: todo.title.getValue(),
      });

      // Value Objectからプリミティブ型に変換してDTOを返す
      return {
        id: todo.id.getValue(),
        userId: todo.userId.getValue(),
        title: todo.title.getValue(),
        body: todo.body.getValue(),
        status: todo.status,
        createdAt: new Date(todo.createdAt.epochMilliseconds),
        updatedAt: new Date(todo.updatedAt.epochMilliseconds),
      };
    } catch (error) {
      this.logger.error('Failed to create todo', {
        userId: param.userId,
        title: param.title,
        ...buildErrorContext(error),
      });
      throw error;
    }
  }
}
