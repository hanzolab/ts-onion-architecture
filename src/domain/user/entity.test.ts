import { Temporal } from '@js-temporal/polyfill';
import { describe, expect, test } from 'vitest';
import { User } from './entity';
import { Email } from './vo/email';
import { UserId } from './vo/id';
import { Username } from './vo/username';

describe('User', () => {
  describe('create', () => {
    test('新しいユーザーを作成できる', () => {
      const email = Email.from('user@example.com');
      const name = Username.from('John_Doe');

      const user = User.create(email, name);

      expect(user).toBeInstanceOf(User);
      expect(user.id).toBeInstanceOf(UserId);
      expect(user.email.equals(email)).toBe(true);
      expect(user.name).toBe(name);
      expect(user.createdAt).toBeInstanceOf(Temporal.Instant);
      expect(user.updatedAt).toBeInstanceOf(Temporal.Instant);
      expect(user.createdAt.equals(user.updatedAt)).toBe(true);
    });
  });

  describe('reconstruct', () => {
    test('既存のユーザーを復元できる', () => {
      const id = UserId.generate();
      const email = Email.from('user@example.com');
      const name = Username.from('John_Doe');
      const createdAt = Temporal.Instant.from('2024-01-01T00:00:00Z');
      const updatedAt = Temporal.Instant.from('2024-01-02T00:00:00Z');

      const user = User.reconstruct(id, email, name, createdAt, updatedAt);

      expect(user).toBeInstanceOf(User);
      expect(user.id.equals(id)).toBe(true);
      expect(user.email.equals(email)).toBe(true);
      expect(user.name).toBe(name);
      expect(user.createdAt.equals(createdAt)).toBe(true);
      expect(user.updatedAt.equals(updatedAt)).toBe(true);
    });
  });

  describe('changeEmail', () => {
    test('メールアドレスを変更できる', () => {
      const user = User.create(
        Email.from('old@example.com'),
        Username.from('John_Doe'),
      );
      const newEmail = Email.from('new@example.com');

      const updatedUser = user.changeEmail(newEmail);

      expect(updatedUser.email.equals(newEmail)).toBe(true);
      expect(updatedUser.id.equals(user.id)).toBe(true);
      expect(updatedUser.name).toBe(user.name);
      expect(updatedUser.updatedAt.epochMilliseconds).toBeGreaterThanOrEqual(
        user.updatedAt.epochMilliseconds,
      );
    });

    test('元のユーザーは変更されない（イミュータブル）', () => {
      const originalEmail = Email.from('old@example.com');
      const originalName = Username.from('John_Doe');
      const user = User.create(originalEmail, originalName);
      const newEmail = Email.from('new@example.com');

      user.changeEmail(newEmail);

      expect(user.email.equals(originalEmail)).toBe(true);
    });
  });

  describe('changeName', () => {
    test('名前を変更できる', () => {
      const user = User.create(
        Email.from('user@example.com'),
        Username.from('John_Doe'),
      );
      const newName = Username.from('JaneDoe');

      const updatedUser = user.changeName(newName);

      expect(updatedUser.name).toBe(newName);
      expect(updatedUser.id.equals(user.id)).toBe(true);
      expect(updatedUser.email.equals(user.email)).toBe(true);
      expect(updatedUser.updatedAt.epochMilliseconds).toBeGreaterThanOrEqual(
        user.updatedAt.epochMilliseconds,
      );
    });

    test('元のユーザーは変更されない（イミュータブル）', () => {
      const originalName = Username.from('John_Doe');
      const user = User.create(Email.from('user@example.com'), originalName);

      user.changeName(Username.from('Jane_Doe'));

      expect(user.name).toBe(originalName);
    });

    test('空文字列の名前は許可されない', () => {
      const user = User.create(
        Email.from('user@example.com'),
        Username.from('John_Doe'),
      );

      expect(() => user.changeName(Username.from(''))).toThrow(
        'Username cannot be empty',
      );
      expect(() => user.changeName(Username.from('   '))).toThrow(
        'Username cannot have leading or trailing spaces',
      );
    });
  });

  describe('equals', () => {
    test('同じIDのユーザーは等価である', () => {
      const id = UserId.generate();
      const email = Email.from('user@example.com');
      const name = Username.from('John_Doe');
      const now = Temporal.Now.instant();
      const user1 = User.reconstruct(id, email, name, now, now);
      const user2 = User.reconstruct(
        id,
        Email.from('another@example.com'),
        Username.from('Jane_Doe'),
        now,
        now,
      );

      expect(user1.equals(user2)).toBe(true);
    });

    test('異なるIDのユーザーは等価でない', () => {
      const email = Email.from('user@example.com');
      const name = Username.from('John_Doe');
      const user1 = User.create(email, name);
      const user2 = User.create(email, name);

      expect(user1.equals(user2)).toBe(false);
    });
  });
});
