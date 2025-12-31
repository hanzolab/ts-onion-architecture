import { describe, expect, test } from 'vitest';
import { UserId } from './id';

describe('UserId', () => {
  describe('generate', () => {
    test('新しいUserIdを生成できる', () => {
      const id = UserId.generate();

      expect(id).toBeInstanceOf(UserId);
      expect(id.getValue()).toBeDefined();
      expect(id.getValue()).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
    });

    test('生成するたびに異なるIDを生成する', () => {
      const id1 = UserId.generate();
      const id2 = UserId.generate();

      expect(id1.getValue()).not.toBe(id2.getValue());
    });
  });

  describe('from', () => {
    test('有効なUUID文字列からUserIdを復元できる', () => {
      const validUuid = '018e8c6a-4e5f-7b9d-8c2a-3f1e4d5c6b7a';
      const id = UserId.from(validUuid);

      expect(id).toBeInstanceOf(UserId);
      expect(id.getValue()).toBe(validUuid);
    });

    test('空文字列の場合はエラーを投げる', () => {
      expect(() => UserId.from('')).toThrow('ID cannot be empty');
    });

    test('不正なUUID形式の場合はエラーを投げる', () => {
      expect(() => UserId.from('invalid-uuid')).toThrow('Invalid UUID format');
      expect(() => UserId.from('12345678-1234-1234-1234')).toThrow(
        'Invalid UUID format',
      );
    });
  });

  describe('getValue', () => {
    test('IDの値を取得できる', () => {
      const id = UserId.generate();
      const value = id.getValue();

      expect(typeof value).toBe('string');
      expect(value.length).toBeGreaterThan(0);
    });
  });

  describe('equals', () => {
    test('同じ値のUserIdは等価である', () => {
      const uuid = '018e8c6a-4e5f-7b9d-8c2a-3f1e4d5c6b7a';
      const id1 = UserId.from(uuid);
      const id2 = UserId.from(uuid);

      expect(id1.equals(id2)).toBe(true);
    });

    test('異なる値のUserIdは等価でない', () => {
      const id1 = UserId.generate();
      const id2 = UserId.generate();

      expect(id1.equals(id2)).toBe(false);
    });
  });

  describe('toString', () => {
    test('文字列表現を取得できる', () => {
      const uuid = '018e8c6a-4e5f-7b9d-8c2a-3f1e4d5c6b7a';
      const id = UserId.from(uuid);

      expect(id.toString()).toBe(uuid);
    });
  });
});
