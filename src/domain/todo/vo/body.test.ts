import { describe, expect, test } from 'vitest';
import { TodoBody } from './body';

describe('TodoBody', () => {
  describe('from', () => {
    test('有効な本文からTodoBodyを生成できる', () => {
      const validBodies = [
        '本文の内容',
        'This is a todo body',
        'a',
        'A'.repeat(1000), // 最大長
      ];

      for (const body of validBodies) {
        const todoBody = TodoBody.from(body);
        expect(todoBody).toBeInstanceOf(TodoBody);
        expect(todoBody.getValue()).toBe(body);
      }
    });

    test('空文字列からTodoBodyを生成できる', () => {
      const todoBody = TodoBody.from('');
      expect(todoBody).toBeInstanceOf(TodoBody);
      expect(todoBody.getValue()).toBe('');
      expect(todoBody.isEmpty()).toBe(true);
    });

    test('前後に空白がある場合はエラーを投げる', () => {
      expect(() => TodoBody.from(' body')).toThrow(
        'TodoBody cannot have leading or trailing spaces',
      );
      expect(() => TodoBody.from('body ')).toThrow(
        'TodoBody cannot have leading or trailing spaces',
      );
      expect(() => TodoBody.from(' body ')).toThrow(
        'TodoBody cannot have leading or trailing spaces',
      );
    });

    test('1000文字を超える場合はエラーを投げる', () => {
      const longBody = 'a'.repeat(1001);
      expect(() => TodoBody.from(longBody)).toThrow(
        'TodoBody must be at most 1000 characters',
      );
    });
  });

  describe('empty', () => {
    test('空のTodoBodyを生成できる', () => {
      const todoBody = TodoBody.empty();

      expect(todoBody).toBeInstanceOf(TodoBody);
      expect(todoBody.getValue()).toBe('');
      expect(todoBody.isEmpty()).toBe(true);
    });
  });

  describe('getValue', () => {
    test('本文の値を取得できる', () => {
      const body = 'This is a todo body';
      const todoBody = TodoBody.from(body);

      expect(todoBody.getValue()).toBe(body);
    });
  });

  describe('isEmpty', () => {
    test('空の本文の場合はtrueを返す', () => {
      const todoBody = TodoBody.empty();

      expect(todoBody.isEmpty()).toBe(true);
    });

    test('本文がある場合はfalseを返す', () => {
      const todoBody = TodoBody.from('This is a todo body');

      expect(todoBody.isEmpty()).toBe(false);
    });
  });

  describe('equals', () => {
    test('同じ本文は等価である', () => {
      const body1 = TodoBody.from('This is a todo body');
      const body2 = TodoBody.from('This is a todo body');

      expect(body1.equals(body2)).toBe(true);
    });

    test('異なる本文は等価でない', () => {
      const body1 = TodoBody.from('Body 1');
      const body2 = TodoBody.from('Body 2');

      expect(body1.equals(body2)).toBe(false);
    });

    test('空の本文同士は等価である', () => {
      const body1 = TodoBody.empty();
      const body2 = TodoBody.empty();

      expect(body1.equals(body2)).toBe(true);
    });

    test('大文字小文字は区別される', () => {
      const body1 = TodoBody.from('My Body');
      const body2 = TodoBody.from('my body');

      expect(body1.equals(body2)).toBe(false);
    });
  });

  describe('toString', () => {
    test('文字列表現を取得できる', () => {
      const body = 'This is a todo body';
      const todoBody = TodoBody.from(body);

      expect(todoBody.toString()).toBe(body);
    });
  });
});
