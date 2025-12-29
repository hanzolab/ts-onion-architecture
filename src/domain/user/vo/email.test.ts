import { describe, expect, test } from 'vitest';
import { Email } from './email';

describe('Email', () => {
  describe('from', () => {
    test('有効なメールアドレスからEmailを生成できる', () => {
      const validEmails = [
        'user@example.com',
        'test.user@example.co.jp',
        'user+tag@example.com',
        'user_name@example-domain.com',
      ];

      for (const emailStr of validEmails) {
        const email = Email.from(emailStr);
        expect(email).toBeInstanceOf(Email);
        expect(email.getValue()).toBe(emailStr);
      }
    });

    test('空文字列の場合はエラーを投げる', () => {
      expect(() => Email.from('')).toThrow('Email cannot be empty');
    });

    test('不正なメールアドレス形式の場合はエラーを投げる', () => {
      const invalidEmails = [
        'invalid',
        '@example.com',
        'user@',
        'user@.com',
        'user @example.com',
      ];

      for (const emailStr of invalidEmails) {
        expect(() => Email.from(emailStr)).toThrow('Invalid email format');
      }
    });

    test('メールアドレスが254文字を超える場合はエラーを投げる', () => {
      const longEmail = `${'a'.repeat(50)}@${'b'.repeat(200)}.com`;
      expect(() => Email.from(longEmail)).toThrow(
        'Email is too long (max 254 characters)',
      );
    });

    test('ローカル部分が64文字を超える場合はエラーを投げる', () => {
      const longLocalPart = `${'a'.repeat(65)}@example.com`;
      expect(() => Email.from(longLocalPart)).toThrow(
        'Email local part is too long (max 64 characters)',
      );
    });

    test('ドメイン部分が255文字を超える場合はエラーを投げる', () => {
      // ドメインだけで256文字（全体は260文字）にして、ドメインチェックが先に動くようにする
      const longDomain = `a@${'b'.repeat(256)}`;
      expect(() => Email.from(longDomain)).toThrow(
        'Email domain is too long (max 255 characters)',
      );
    });
  });

  describe('getValue', () => {
    test('メールアドレスの値を取得できる', () => {
      const emailStr = 'user@example.com';
      const email = Email.from(emailStr);

      expect(email.getValue()).toBe(emailStr);
    });
  });

  describe('getNormalized', () => {
    test('正規化されたメールアドレスを取得できる（小文字）', () => {
      const email = Email.from('User@Example.COM');

      expect(email.getNormalized()).toBe('user@example.com');
    });

    test('元の値は変更されない', () => {
      const originalEmail = 'User@Example.COM';
      const email = Email.from(originalEmail);

      expect(email.getValue()).toBe(originalEmail);
      expect(email.getNormalized()).toBe('user@example.com');
    });
  });

  describe('equals', () => {
    test('同じメールアドレスは等価である', () => {
      const email1 = Email.from('user@example.com');
      const email2 = Email.from('user@example.com');

      expect(email1.equals(email2)).toBe(true);
    });

    test('大文字小文字が異なっても等価とみなす', () => {
      const email1 = Email.from('User@Example.COM');
      const email2 = Email.from('user@example.com');

      expect(email1.equals(email2)).toBe(true);
    });

    test('異なるメールアドレスは等価でない', () => {
      const email1 = Email.from('user1@example.com');
      const email2 = Email.from('user2@example.com');

      expect(email1.equals(email2)).toBe(false);
    });
  });

  describe('toString', () => {
    test('文字列表現を取得できる', () => {
      const emailStr = 'user@example.com';
      const email = Email.from(emailStr);

      expect(email.toString()).toBe(emailStr);
    });
  });
});
