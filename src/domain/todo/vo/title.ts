/**
 * TodoTitle Value Object
 * Todoのタイトルを表現するValue Object
 */
export class TodoTitle {
  private constructor(private readonly value: string) {
    this.validate(value);
  }

  /**
   * タイトルからTodoTitleを生成
   */
  static from(value: string): TodoTitle {
    return new TodoTitle(value);
  }

  /**
   * タイトルのバリデーション
   */
  private validate(value: string): void {
    if (!value) {
      throw new Error('TodoTitle cannot be empty');
    }

    // 前後の空白を除去した値で検証
    const trimmedValue = value.trim();
    if (trimmedValue !== value) {
      throw new Error('TodoTitle cannot have leading or trailing spaces');
    }

    // 文字数制限（1文字以上、200文字以下）
    if (trimmedValue.length < 1) {
      throw new Error('TodoTitle must be at least 1 character');
    }

    if (trimmedValue.length > 200) {
      throw new Error('TodoTitle must be at most 200 characters');
    }
  }

  /**
   * タイトルの値を取得
   */
  getValue(): string {
    return this.value;
  }

  /**
   * タイトルの等価性を比較
   */
  equals(other: TodoTitle): boolean {
    return this.value === other.value;
  }

  /**
   * 文字列表現
   */
  toString(): string {
    return this.getValue();
  }
}
