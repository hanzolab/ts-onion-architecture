/**
 * Username Value Object
 * ユーザー名を表現するValue Object
 */
export class Username {
  private constructor(private readonly value: string) {
    this.validate(value);
  }

  /**
   * ユーザー名からUsernameを生成
   */
  static from(value: string): Username {
    return new Username(value);
  }

  /**
   * ユーザー名のバリデーション
   */
  private validate(value: string): void {
    if (!value) {
      throw new Error('Username cannot be empty');
    }

    // 前後の空白を除去した値で検証
    const trimmedValue = value.trim();
    if (trimmedValue !== value) {
      throw new Error('Username cannot have leading or trailing spaces');
    }

    // 文字数制限（3文字以上、50文字以下）
    if (trimmedValue.length < 3) {
      throw new Error('Username must be at least 3 characters');
    }

    if (trimmedValue.length > 50) {
      throw new Error('Username must be at most 50 characters');
    }

    // 使用可能な文字：英数字、アンダースコア、ハイフン
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(trimmedValue)) {
      throw new Error(
        'Username can only contain alphanumeric characters, underscores, and hyphens',
      );
    }
  }

  /**
   * ユーザー名の値を取得
   */
  getValue(): string {
    return this.value;
  }

  /**
   * ユーザー名の等価性を比較
   */
  equals(other: Username): boolean {
    return this.value === other.value;
  }

  /**
   * 文字列表現
   */
  toString(): string {
    return this.getValue();
  }
}
