/**
 * 各テストファイル実行前にDB接続情報を切り替え
 * WorkerのIDを元に、起動時に用意していたDATABASE_URL_TEST_1、DATABASE_URL_TEST_2...
 * といった環境変数を参照し、DATABASE_URLに設定しなおす
 */
const poolId = process.env.VITEST_POOL_ID;
if (!poolId) {
  throw new Error('VITEST_POOL_ID is not set');
}

// VITEST_POOL_IDは "1-0" のような形式の場合があるので、最初の数字を取得
// または単純に数値の場合もある
const workerIdMatch = poolId.match(/^(\d+)/);
if (!workerIdMatch) {
  throw new Error(`Invalid VITEST_POOL_ID format: ${poolId}`);
}

const workerId = workerIdMatch[1];
const databaseUrl = process.env[`DATABASE_URL_TEST_${workerId}`];
if (!databaseUrl) {
  throw new Error(
    `DATABASE_URL_TEST_${workerId} is not set. Make sure globalSetup has been executed. Pool ID: ${poolId}`,
  );
}

// 各Worker用のDB接続情報へ切り替え
process.env.DATABASE_URL = databaseUrl;
