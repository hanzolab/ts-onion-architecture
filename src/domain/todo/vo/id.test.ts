import { describe, expect, test } from 'vitest';
import { TodoId } from './id';

describe('TodoId', () => {
  describe('generate', () => {
    test('新しいTodoIdを生成できる', () => {
      const id = TodoId.generate();

      expect(id).toBeInstanceOf(TodoId);
      expect(id.getValue()).toBeDefined();
      expect(id.getValue()).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      );
    });

    test('生成するたびに異なるIDを生成する', () => {
      const id1 = TodoId.generate();
      const id2 = TodoId.generate();

      expect(id1.getValue()).not.toBe(id2.getValue());
    });
  });

  describe('from', () => {
    test('有効なUUID文字列からTodoIdを復元できる', () => {
      const validUuid = '018e8c6a-4e5f-7b9d-8c2a-3f1e4d5c6b7a';
      const id = TodoId.from(validUuid);

      expect(id).toBeInstanceOf(TodoId);
      expect(id.getValue()).toBe(validUuid);
    });

    test('空文字列の場合はエラーを投げる', () => {
      expect(() => TodoId.from('')).toThrow('ID cannot be empty');
    });

    test('不正なUUID形式の場合はエラーを投げる', () => {
      expect(() => TodoId.from('invalid-uuid')).toThrow('Invalid UUID format');
    });
  });

  describe('getValue', () => {
    test('IDの値を取得できる', () => {
      const id = TodoId.generate();
      const value = id.getValue();

      expect(typeof value).toBe('string');
      expect(value.length).toBeGreaterThan(0);
    });
  });

  describe('equals', () => {
    test('同じ値のTodoIdは等価である', () => {
      const uuid = '018e8c6a-4e5f-7b9d-8c2a-3f1e4d5c6b7a';
      const id1 = TodoId.from(uuid);
      const id2 = TodoId.from(uuid);

      expect(id1.equals(id2)).toBe(true);
    });

    test('異なる値のTodoIdは等価でない', () => {
      const id1 = TodoId.generate();
      const id2 = TodoId.generate();

      expect(id1.equals(id2)).toBe(false);
    });
  });

  describe('toString', () => {
    test('文字列表現を取得できる', () => {
      const uuid = '018e8c6a-4e5f-7b9d-8c2a-3f1e4d5c6b7a';
      const id = TodoId.from(uuid);

      expect(id.toString()).toBe(uuid);
    });
  });
});
