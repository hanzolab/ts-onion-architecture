import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from 'lib/prisma';

/**
 * PrismaClientのインスタンスを作成する
 *
 * 注意: この関数は呼び出し時にprocess.env.DATABASE_URLを読み取るため、
 * 並列実行環境（各Workerプロセス）で正しく動作します。
 * モジュールレベルでキャッシュせず、各テストのbeforeAll内で呼び出すこと。
 *
 * @returns PrismaClientのインスタンス
 * @throws Error DATABASE_URLが設定されていない場合
 */
export function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set');
  }

  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

/**
 * データベースの全テーブルをTRUNCATEしてリセットする
 *
 * @param prisma PrismaClientのインスタンス
 * @throws Error データベースリセットに失敗した場合
 */
export async function resetDatabase(prisma: PrismaClient): Promise<void> {
  const tablenames = await prisma.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

  const tables = tablenames
    .map(({ tablename }) => tablename)
    // _prisma_migrationsはマイグレーションの履歴テーブルなので除外
    .filter((name) => name !== '_prisma_migrations')
    .map((name) => `"public"."${name}"`)
    .join(', ');

  if (tables) {
    try {
      await prisma.$executeRawUnsafe(
        `TRUNCATE TABLE ${tables} RESTART IDENTITY CASCADE;`,
      );
    } catch (error) {
      throw new Error(
        `Failed to reset database: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
