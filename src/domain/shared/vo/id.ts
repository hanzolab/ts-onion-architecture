import { v7 as uuidv7 } from 'uuid';

/**
 * ID Value Object の抽象基底クラス
 * UUID v7を使用した一意な識別子
 */
export abstract class BaseId {
  protected constructor(private readonly value: string) {
    this.validate(value);
  }

  /**
   * UUID v7を生成
   */
  protected static generateUuid(): string {
    return uuidv7();
  }

  /**
   * IDのバリデーション
   */
  private validate(value: string): void {
    if (!value) {
      throw new Error('ID cannot be empty');
    }

    // UUID形式の検証
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(value)) {
      throw new Error('Invalid UUID format');
    }
  }

  /**
   * IDの値を取得
   */
  getValue(): string {
    return this.value;
  }

  /**
   * IDの等価性を比較
   */
  equals(other: BaseId): boolean {
    if (this.constructor !== other.constructor) {
      return false;
    }
    return this.value === other.value;
  }

  /**
   * 文字列表現
   */
  toString(): string {
    return this.getValue();
  }
}
