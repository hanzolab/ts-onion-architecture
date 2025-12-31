import { describe, expect, test } from 'vitest';
import { TodoTitle } from './title';

describe('TodoTitle', () => {
  describe('from', () => {
    test('有効なタイトルからTodoTitleを生成できる', () => {
      const validTitles = [
        'タスク1',
        'My Todo',
        'a',
        'A'.repeat(200), // 最大長
      ];

      for (const title of validTitles) {
        const todoTitle = TodoTitle.from(title);
        expect(todoTitle).toBeInstanceOf(TodoTitle);
        expect(todoTitle.getValue()).toBe(title);
      }
    });

    test('空文字列の場合はエラーを投げる', () => {
      expect(() => TodoTitle.from('')).toThrow('TodoTitle cannot be empty');
    });

    test('前後に空白がある場合はエラーを投げる', () => {
      expect(() => TodoTitle.from(' title')).toThrow(
        'TodoTitle cannot have leading or trailing spaces',
      );
      expect(() => TodoTitle.from('title ')).toThrow(
        'TodoTitle cannot have leading or trailing spaces',
      );
      expect(() => TodoTitle.from(' title ')).toThrow(
        'TodoTitle cannot have leading or trailing spaces',
      );
    });

    test('200文字を超える場合はエラーを投げる', () => {
      const longTitle = 'a'.repeat(201);
      expect(() => TodoTitle.from(longTitle)).toThrow(
        'TodoTitle must be at most 200 characters',
      );
    });
  });

  describe('getValue', () => {
    test('タイトルの値を取得できる', () => {
      const title = 'My Todo';
      const todoTitle = TodoTitle.from(title);

      expect(todoTitle.getValue()).toBe(title);
    });
  });

  describe('equals', () => {
    test('同じタイトルは等価である', () => {
      const title1 = TodoTitle.from('My Todo');
      const title2 = TodoTitle.from('My Todo');

      expect(title1.equals(title2)).toBe(true);
    });

    test('異なるタイトルは等価でない', () => {
      const title1 = TodoTitle.from('Todo 1');
      const title2 = TodoTitle.from('Todo 2');

      expect(title1.equals(title2)).toBe(false);
    });

    test('大文字小文字は区別される', () => {
      const title1 = TodoTitle.from('My Todo');
      const title2 = TodoTitle.from('my todo');

      expect(title1.equals(title2)).toBe(false);
    });
  });

  describe('toString', () => {
    test('文字列表現を取得できる', () => {
      const title = 'My Todo';
      const todoTitle = TodoTitle.from(title);

      expect(todoTitle.toString()).toBe(title);
    });
  });
});
