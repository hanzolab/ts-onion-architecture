/**
 * TodoBody Value Object
 * Todoの本文を表現するValue Object
 */
export class TodoBody {
  private constructor(private readonly value: string) {
    this.validate(value);
  }

  /**
   * 本文からTodoBodyを生成
   */
  static from(value: string): TodoBody {
    return new TodoBody(value);
  }

  /**
   * 空の本文からTodoBodyを生成
   */
  static empty(): TodoBody {
    return new TodoBody('');
  }

  /**
   * 本文のバリデーション
   */
  private validate(value: string): void {
    // 空文字列は許可（本文は任意）
    if (value === '') {
      return;
    }

    // 前後の空白を除去した値で検証
    const trimmedValue = value.trim();
    if (trimmedValue !== value) {
      throw new Error('TodoBody cannot have leading or trailing spaces');
    }

    // 文字数制限（1000文字以下）
    if (trimmedValue.length > 1000) {
      throw new Error('TodoBody must be at most 1000 characters');
    }
  }

  /**
   * 本文の値を取得
   */
  getValue(): string {
    return this.value;
  }

  /**
   * 本文が空かどうかを判定
   */
  isEmpty(): boolean {
    return this.value === '';
  }

  /**
   * 本文の等価性を比較
   */
  equals(other: TodoBody): boolean {
    return this.value === other.value;
  }

  /**
   * 文字列表現
   */
  toString(): string {
    return this.getValue();
  }
}
