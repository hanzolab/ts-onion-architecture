import { AsyncLocalStorage } from 'node:async_hooks';
import {
  configure,
  getConsoleSink,
  getJsonLinesFormatter,
  getLogger as getLogTapeLogger,
  type Logger,
  type LogLevel,
  parseLogLevel,
} from '@logtape/logtape';

export type LogContext = {
  requestId?: string;
  userId?: string;
  traceId?: string;
  [key: string]: unknown;
};

/**
 * リクエストスコープのコンテキストを保持するAsyncLocalStorage
 * LogTapeの暗黙的コンテキスト機能で使用されます
 */
const contextStorage = new AsyncLocalStorage<LogContext>();

/**
 * ログ設定の初期化状態を管理
 */
const initializationState = {
  isConfigured: false,
  initializationPromise: null as Promise<void> | null,
};

/**
 * 環境変数からログレベルを取得
 * 無効な値が設定されている場合は警告を出力してデフォルト値を返す
 */
const getLogLevelFromEnv = (): LogLevel => {
  const envLevel = process.env.LOG_LEVEL;
  if (!envLevel) {
    return 'info';
  }

  try {
    return parseLogLevel(envLevel);
  } catch {
    console.warn(
      `[Logger] Invalid LOG_LEVEL environment variable: "${envLevel}". Using default: "info"`,
    );
    return 'info';
  }
};

/**
 * ログ設定を初期化
 * - 並列呼び出しは同一Promiseを共有
 * - 初期化失敗時は次回呼び出しで再試行可能
 */
const initializeLogConfiguration = async (): Promise<void> => {
  if (initializationState.isConfigured) {
    return;
  }

  // 初期化中ならその Promise を返す
  if (initializationState.initializationPromise) {
    return initializationState.initializationPromise;
  }

  initializationState.initializationPromise = (async () => {
    try {
      await configure({
        sinks: {
          console: getConsoleSink({
            formatter: getJsonLinesFormatter(),
          }),
        },
        loggers: [
          {
            category: [],
            lowestLevel: getLogLevelFromEnv(),
            sinks: ['console'],
          },
        ],
        contextLocalStorage: contextStorage,
      });

      initializationState.isConfigured = true;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes('already configured')
      ) {
        // 他の場所で既に configure 済み
        initializationState.isConfigured = true;
        return;
      }

      // 失敗時は再試行可能にする
      throw error;
    } finally {
      // 成否に関わらず Promise はクリア
      initializationState.initializationPromise = null;
    }
  })();

  return initializationState.initializationPromise;
};

/**
 * エラーオブジェクトを構造化ログ用のコンテキストに変換
 */
export const buildErrorContext = (
  error?: Error | unknown,
): Record<string, unknown> => {
  if (!error) {
    return {};
  }

  if (error instanceof Error) {
    return {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
    };
  }

  return {
    error: String(error),
  };
};

/**
 * ロガーを取得
 * 初期化は fire-and-forget で実行
 */
export const getLogger = (category?: string | readonly string[]): Logger => {
  initializeLogConfiguration().catch((error) => {
    console.error(
      '[Logger] Failed to initialize log configuration:',
      error instanceof Error ? error.message : String(error),
    );
  });

  const categoryArray = category
    ? typeof category === 'string'
      ? [category]
      : category
    : [];

  return getLogTapeLogger(categoryArray);
};

/**
 * 現在のリクエストコンテキストを設定（既存のコンテキストとマージ）
 */
export const setContext = (context: Partial<LogContext>): void => {
  const currentContext = contextStorage.getStore();
  if (currentContext) {
    Object.assign(currentContext, context);
  }
};

/**
 * コンテキスト付きでコードを実行
 */
export const runWithContext = <T>(context: LogContext, fn: () => T): T => {
  return contextStorage.run(context, fn);
};

/**
 * ログ設定をリセット（テスト用など）
 */
export const resetLogger = (): void => {
  initializationState.isConfigured = false;
  initializationState.initializationPromise = null;
};
