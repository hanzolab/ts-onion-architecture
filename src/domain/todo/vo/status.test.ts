import { describe, expect, test } from 'vitest';
import { TodoStatus } from './status';

describe('TodoStatus', () => {
  describe('定数値', () => {
    test('すべてのステータス定数が定義されている', () => {
      expect(TodoStatus.NOT_STARTED).toBe('NOT_STARTED');
      expect(TodoStatus.IN_PROGRESS).toBe('IN_PROGRESS');
      expect(TodoStatus.PENDING).toBe('PENDING');
      expect(TodoStatus.COMPLETED).toBe('COMPLETED');
    });

    test('すべてのステータス値が文字列である', () => {
      expect(typeof TodoStatus.NOT_STARTED).toBe('string');
      expect(typeof TodoStatus.IN_PROGRESS).toBe('string');
      expect(typeof TodoStatus.PENDING).toBe('string');
      expect(typeof TodoStatus.COMPLETED).toBe('string');
    });

    test('すべてのステータス値が一意である', () => {
      const statuses = [
        TodoStatus.NOT_STARTED,
        TodoStatus.IN_PROGRESS,
        TodoStatus.PENDING,
        TodoStatus.COMPLETED,
      ];

      const uniqueStatuses = new Set(statuses);
      expect(uniqueStatuses.size).toBe(statuses.length);
    });
  });

  describe('型の使用', () => {
    test('TodoStatus型の変数に有効な値を代入できる', () => {
      const status1: (typeof TodoStatus)[keyof typeof TodoStatus] =
        TodoStatus.NOT_STARTED;
      const status2: (typeof TodoStatus)[keyof typeof TodoStatus] =
        TodoStatus.IN_PROGRESS;
      const status3: (typeof TodoStatus)[keyof typeof TodoStatus] =
        TodoStatus.PENDING;
      const status4: (typeof TodoStatus)[keyof typeof TodoStatus] =
        TodoStatus.COMPLETED;

      expect(status1).toBe('NOT_STARTED');
      expect(status2).toBe('IN_PROGRESS');
      expect(status3).toBe('PENDING');
      expect(status4).toBe('COMPLETED');
    });
  });
});
