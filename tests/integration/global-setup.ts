import { execSync } from 'node:child_process';
import os from 'node:os';
import {
  PostgreSqlContainer,
  type StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import type { TestProject } from 'vitest/node';

// Reaperを無効化（並列実行時の接続競合を回避）
// teardownで明示的にコンテナを停止するため、Reaperは不要
if (!process.env.TESTCONTAINERS_RYUK_DISABLED) {
  process.env.TESTCONTAINERS_RYUK_DISABLED = 'true';
}

let containers: StartedPostgreSqlContainer[] = [];

/**
 * テスト全体の開始時にWorker数分のTestContainerを起動
 */
export const setup = async (project: TestProject) => {
  // Worker数分Testcontainerを立ち上げる
  // maxWorkersが設定されていない場合はCPU数を使用
  const maxWorkers = project.config.maxWorkers || os.cpus().length;
  const promises: Promise<StartedPostgreSqlContainer>[] = [];

  console.log(`Testcontainer起動開始 (maxWorkers: ${maxWorkers})`);
  for (let i = 1; i <= maxWorkers; i++) {
    // 1から振っていく(process.env.VITEST_POOL_ID と一致するように)
    promises.push(setupTestDatabaseContainer(i));
  }

  containers = await Promise.all(promises);
  console.log('Testcontainer起動完了');
};

/**
 * テスト全体の終了時にTestContainerを停止
 */
export const teardown = async () => {
  console.log('Testcontainer停止開始');
  // Testcontainerを停止する
  await Promise.all(containers.map((container) => container.stop()));
  console.log('Testcontainer停止完了');
};

/**
 * 個別のTestContainerを起動し、マイグレーションを実行
 */
const setupTestDatabaseContainer = async (
  workerId: number,
): Promise<StartedPostgreSqlContainer> => {
  let container: StartedPostgreSqlContainer | null = null;

  try {
    container = await new PostgreSqlContainer('postgres:18')
      // データファイルをtmpfs(メモリ上)に保存することで高速化
      // WSL2環境では動作しない可能性があるため、コメントアウト
      // .withTmpFs({ '/var/lib/postgresql/data': 'rw' })
      .withDatabase('test')
      .withUsername('test')
      .withPassword('test')
      .start();

    // DATABASE_URLを作成
    const databaseUrl = `postgresql://${container.getUsername()}:${container.getPassword()}@${container.getHost()}:${container.getMappedPort(5432)}/${container.getDatabase()}`;

    // Prismaマイグレーションを実行
    try {
      execSync(`DATABASE_URL=${databaseUrl} bunx prisma migrate deploy`, {
        stdio: 'pipe',
      });
      console.log(
        `(workerId:${workerId}) DATABASE_URL: ${databaseUrl.substring(0, 50)}...`,
      );
    } catch (error) {
      if (container) {
        await container.stop().catch(() => {
          // 停止失敗は無視
        });
      }
      throw new Error(
        `Failed to run migrations for worker ${workerId}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    // 各Worker用に環境変数として保存
    process.env[`DATABASE_URL_TEST_${workerId}`] = databaseUrl;

    return container;
  } catch (error) {
    if (container) {
      await container.stop().catch(() => {
        // 停止失敗は無視
      });
    }
    throw error;
  }
};
