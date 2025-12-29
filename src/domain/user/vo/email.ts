/**
 * Email Value Object
 * メールアドレスを表現するValue Object
 */
export class Email {
  private constructor(private readonly value: string) {
    this.validate(value);
  }

  /**
   * メールアドレスからEmailを生成
   */
  static from(value: string): Email {
    return new Email(value);
  }

  /**
   * メールアドレスのバリデーション
   */
  private validate(value: string): void {
    if (!value) {
      throw new Error('Email cannot be empty');
    }

    // @記号の存在確認
    if (!value.includes('@')) {
      throw new Error('Invalid email format');
    }

    // ローカル部分とドメイン部分の検証
    const [localPart, domain] = value.split('@');

    if (!localPart || !domain) {
      throw new Error('Invalid email format');
    }

    if (localPart.length > 64) {
      throw new Error('Email local part is too long (max 64 characters)');
    }

    if (domain.length > 255) {
      throw new Error('Email domain is too long (max 255 characters)');
    }

    // メールアドレスの長さ制限（RFC 5321）
    if (value.length > 254) {
      throw new Error('Email is too long (max 254 characters)');
    }

    // 基本的なメールアドレス形式の検証
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      throw new Error('Invalid email format');
    }
  }

  /**
   * メールアドレスの値を取得
   */
  getValue(): string {
    return this.value;
  }

  /**
   * 正規化されたメールアドレスを取得（小文字）
   */
  getNormalized(): string {
    return this.value.toLowerCase();
  }

  /**
   * メールアドレスの等価性を比較
   */
  equals(other: Email): boolean {
    return this.getNormalized() === other.getNormalized();
  }

  /**
   * 文字列表現
   */
  toString(): string {
    return this.getValue();
  }
}
