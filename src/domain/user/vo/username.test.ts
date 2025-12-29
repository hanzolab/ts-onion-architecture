import { describe, expect, test } from 'vitest';
import { Username } from './username';

describe('Username', () => {
  describe('from', () => {
    test('有効なユーザー名からUsernameを生成できる', () => {
      const validUsernames = [
        'user123',
        'test_user',
        'my-username',
        'User_Name-123',
        'abc',
      ];

      for (const name of validUsernames) {
        const username = Username.from(name);
        expect(username).toBeInstanceOf(Username);
        expect(username.getValue()).toBe(name);
      }
    });

    test('空文字列の場合はエラーを投げる', () => {
      expect(() => Username.from('')).toThrow('Username cannot be empty');
    });

    test('前後に空白がある場合はエラーを投げる', () => {
      expect(() => Username.from(' username')).toThrow(
        'Username cannot have leading or trailing spaces',
      );
      expect(() => Username.from('username ')).toThrow(
        'Username cannot have leading or trailing spaces',
      );
      expect(() => Username.from(' username ')).toThrow(
        'Username cannot have leading or trailing spaces',
      );
    });

    test('3文字未満の場合はエラーを投げる', () => {
      expect(() => Username.from('ab')).toThrow(
        'Username must be at least 3 characters',
      );
      expect(() => Username.from('a')).toThrow(
        'Username must be at least 3 characters',
      );
    });

    test('50文字を超える場合はエラーを投げる', () => {
      const longUsername = 'a'.repeat(51);
      expect(() => Username.from(longUsername)).toThrow(
        'Username must be at most 50 characters',
      );
    });

    test('不正な文字が含まれる場合はエラーを投げる', () => {
      const invalidUsernames = [
        'user name',
        'user@example',
        'user!name',
        'user#123',
        'user$name',
        'ユーザー',
      ];

      for (const name of invalidUsernames) {
        expect(() => Username.from(name)).toThrow(
          'Username can only contain alphanumeric characters, underscores, and hyphens',
        );
      }
    });
  });

  describe('getValue', () => {
    test('ユーザー名の値を取得できる', () => {
      const name = 'test_user';
      const username = Username.from(name);

      expect(username.getValue()).toBe(name);
    });
  });

  describe('equals', () => {
    test('同じユーザー名は等価である', () => {
      const username1 = Username.from('test_user');
      const username2 = Username.from('test_user');

      expect(username1.equals(username2)).toBe(true);
    });

    test('異なるユーザー名は等価でない', () => {
      const username1 = Username.from('user1');
      const username2 = Username.from('user2');

      expect(username1.equals(username2)).toBe(false);
    });

    test('大文字小文字は区別される', () => {
      const username1 = Username.from('TestUser');
      const username2 = Username.from('testuser');

      expect(username1.equals(username2)).toBe(false);
    });
  });

  describe('toString', () => {
    test('文字列表現を取得できる', () => {
      const name = 'test_user';
      const username = Username.from(name);

      expect(username.toString()).toBe(name);
    });
  });
});
