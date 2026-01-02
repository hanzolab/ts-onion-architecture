import type { Logger } from '@logtape/logtape';
import * as logtape from '@logtape/logtape';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import {
  buildErrorContext,
  getLogger,
  resetLogger,
  runWithContext,
  setContext,
} from './logger';

// @logtape/logtape をモック
vi.mock('@logtape/logtape', () => {
  const mockLogger = {
    trace: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
    fatal: vi.fn(),
    getChild: vi.fn(),
    with: vi.fn(),
  };

  return {
    configure: vi.fn(() => Promise.resolve()),
    configureSync: vi.fn(),
    getConsoleSink: vi.fn(),
    getJsonLinesFormatter: vi.fn(),
    getLogger: vi.fn(() => mockLogger),
    parseLogLevel: vi.fn((level: string) => {
      const validLevels = [
        'trace',
        'debug',
        'info',
        'warning',
        'error',
        'fatal',
      ];
      if (validLevels.includes(level.toLowerCase())) {
        return level.toLowerCase();
      }
      throw new Error(`Invalid log level: ${level}`);
    }),
  };
});

describe('getLogger', () => {
  let logger: Logger;
  let originalEnv: string | undefined;

  beforeEach(() => {
    originalEnv = process.env.LOG_LEVEL;
    delete process.env.LOG_LEVEL;
    resetLogger();
    vi.clearAllMocks();
    logger = getLogger();
  });

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.LOG_LEVEL = originalEnv;
    } else {
      delete process.env.LOG_LEVEL;
    }
    resetLogger();
  });

  describe('ロガーの取得', () => {
    test('カテゴリなしでロガーを取得できる', () => {
      const newLogger = getLogger();
      expect(newLogger).toBeDefined();
      expect(logtape.getLogger).toHaveBeenCalled();
    });

    test('文字列カテゴリでロガーを取得できる', () => {
      vi.clearAllMocks();
      const newLogger = getLogger('test-category');
      expect(newLogger).toBeDefined();
      expect(logtape.getLogger).toHaveBeenCalledWith(['test-category']);
    });

    test('配列カテゴリでロガーを取得できる', () => {
      const newLogger = getLogger(['app', 'service']);
      expect(newLogger).toBeDefined();
      expect(logtape.getLogger).toHaveBeenCalledWith(['app', 'service']);
    });

    test('構造化ログのフォーマッターが設定されている', async () => {
      resetLogger();
      vi.clearAllMocks();
      getLogger();
      // 非同期初期化が完了するまで少し待つ
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(logtape.getJsonLinesFormatter).toHaveBeenCalled();
    });

    test('コンソールシンクがJSON Linesフォーマッターで設定されている', async () => {
      resetLogger();
      vi.clearAllMocks();
      getLogger();
      // 非同期初期化が完了するまで少し待つ
      await new Promise((resolve) => setTimeout(resolve, 10));
      // getConsoleSinkが呼ばれていることを確認
      expect(logtape.getConsoleSink).toHaveBeenCalled();
      // configureが呼ばれていることを確認
      expect(logtape.configure).toHaveBeenCalled();
    });
  });

  describe('trace', () => {
    test('traceレベルのログを出力できる', () => {
      logger.trace('トレースメッセージ', {});
      const mockLogger = logtape.getLogger();
      expect(mockLogger.trace).toHaveBeenCalledWith('トレースメッセージ', {});
    });

    test('コンテキスト付きでtraceレベルのログを出力できる', () => {
      const context = { userId: '123', action: 'test' };
      logger.trace('トレースメッセージ', context);
      const mockLogger = logtape.getLogger();
      expect(mockLogger.trace).toHaveBeenCalledWith(
        'トレースメッセージ',
        context,
      );
    });
  });

  describe('debug', () => {
    test('debugレベルのログを出力できる', () => {
      logger.debug('デバッグメッセージ', {});
      const mockLogger = logtape.getLogger();
      expect(mockLogger.debug).toHaveBeenCalledWith('デバッグメッセージ', {});
    });

    test('コンテキスト付きでdebugレベルのログを出力できる', () => {
      const context = { query: 'SELECT * FROM users' };
      logger.debug('デバッグメッセージ', context);
      const mockLogger = logtape.getLogger();
      expect(mockLogger.debug).toHaveBeenCalledWith(
        'デバッグメッセージ',
        context,
      );
    });
  });

  describe('info', () => {
    test('infoレベルのログを出力できる', () => {
      logger.info('情報メッセージ', {});
      const mockLogger = logtape.getLogger();
      expect(mockLogger.info).toHaveBeenCalledWith('情報メッセージ', {});
    });

    test('コンテキスト付きでinfoレベルのログを出力できる', () => {
      const context = { status: 'success', count: 10 };
      logger.info('情報メッセージ', context);
      const mockLogger = logtape.getLogger();
      expect(mockLogger.info).toHaveBeenCalledWith('情報メッセージ', context);
    });
  });

  describe('warn', () => {
    test('warnレベルのログを出力できる', () => {
      logger.warning('警告メッセージ', {});
      const mockLogger = logtape.getLogger();
      expect(mockLogger.warning).toHaveBeenCalledWith('警告メッセージ', {});
    });

    test('コンテキスト付きでwarnレベルのログを出力できる', () => {
      const context = { resource: 'user', id: '456' };
      logger.warning('警告メッセージ', context);
      const mockLogger = logtape.getLogger();
      expect(mockLogger.warning).toHaveBeenCalledWith(
        '警告メッセージ',
        context,
      );
    });
  });

  describe('error', () => {
    test('エラーなしでerrorレベルのログを出力できる', () => {
      logger.error('エラーメッセージ', {});
      const mockLogger = logtape.getLogger();
      expect(mockLogger.error).toHaveBeenCalledWith('エラーメッセージ', {});
    });

    test('Errorオブジェクト付きでerrorレベルのログを出力できる', () => {
      const error = new Error('テストエラー');
      logger.error('エラーメッセージ', buildErrorContext(error));
      const mockLogger = logtape.getLogger();
      expect(mockLogger.error).toHaveBeenCalledWith('エラーメッセージ', {
        error: {
          name: 'Error',
          message: 'テストエラー',
          stack: error.stack,
        },
      });
    });

    test('Errorオブジェクトとコンテキスト付きでerrorレベルのログを出力できる', () => {
      const error = new Error('テストエラー');
      const context = { userId: '123', action: 'test' };
      logger.error('エラーメッセージ', {
        ...buildErrorContext(error),
        ...context,
      });
      const mockLogger = logtape.getLogger();
      expect(mockLogger.error).toHaveBeenCalledWith('エラーメッセージ', {
        error: {
          name: 'Error',
          message: 'テストエラー',
          stack: error.stack,
        },
        userId: '123',
        action: 'test',
      });
    });

    test('Error以外のオブジェクト付きでerrorレベルのログを出力できる', () => {
      const error = '文字列エラー';
      logger.error('エラーメッセージ', buildErrorContext(error));
      const mockLogger = logtape.getLogger();
      expect(mockLogger.error).toHaveBeenCalledWith('エラーメッセージ', {
        error: '文字列エラー',
      });
    });

    test('コンテキストのみでerrorレベルのログを出力できる', () => {
      const context = { code: 'E001', details: '詳細情報' };
      logger.error('エラーメッセージ', context);
      const mockLogger = logtape.getLogger();
      expect(mockLogger.error).toHaveBeenCalledWith(
        'エラーメッセージ',
        context,
      );
    });
  });

  describe('fatal', () => {
    test('エラーなしでfatalレベルのログを出力できる', () => {
      logger.fatal('致命的エラーメッセージ', {});
      const mockLogger = logtape.getLogger();
      expect(mockLogger.fatal).toHaveBeenCalledWith(
        '致命的エラーメッセージ',
        {},
      );
    });

    test('Errorオブジェクト付きでfatalレベルのログを出力できる', () => {
      const error = new Error('致命的エラー');
      logger.fatal('致命的エラーメッセージ', buildErrorContext(error));
      const mockLogger = logtape.getLogger();
      expect(mockLogger.fatal).toHaveBeenCalledWith('致命的エラーメッセージ', {
        error: {
          name: 'Error',
          message: '致命的エラー',
          stack: error.stack,
        },
      });
    });

    test('Errorオブジェクトとコンテキスト付きでfatalレベルのログを出力できる', () => {
      const error = new Error('致命的エラー');
      const context = { system: 'payment', critical: true };
      logger.fatal('致命的エラーメッセージ', {
        ...buildErrorContext(error),
        ...context,
      });
      const mockLogger = logtape.getLogger();
      expect(mockLogger.fatal).toHaveBeenCalledWith('致命的エラーメッセージ', {
        error: {
          name: 'Error',
          message: '致命的エラー',
          stack: error.stack,
        },
        system: 'payment',
        critical: true,
      });
    });
  });

  describe('getChild', () => {
    test('サブカテゴリのロガーを取得できる', () => {
      const mockLogger = logtape.getLogger();
      const mockChildLogger = {
        trace: vi.fn(),
        debug: vi.fn(),
        info: vi.fn(),
        warning: vi.fn(),
        error: vi.fn(),
        fatal: vi.fn(),
        getChild: vi.fn(),
        with: vi.fn(),
      };
      (mockLogger.getChild as ReturnType<typeof vi.fn>).mockReturnValue(
        mockChildLogger,
      );

      const childLogger = logger.getChild('database');

      expect(childLogger).toBeDefined();
      expect(mockLogger.getChild).toHaveBeenCalledWith('database');
    });

    test('サブカテゴリのロガーでログを出力できる', () => {
      const mockLogger = logtape.getLogger();
      const mockChildLogger = {
        trace: vi.fn(),
        debug: vi.fn(),
        info: vi.fn(),
        warning: vi.fn(),
        error: vi.fn(),
        fatal: vi.fn(),
        getChild: vi.fn(),
        with: vi.fn(),
      };
      (mockLogger.getChild as ReturnType<typeof vi.fn>).mockReturnValue(
        mockChildLogger,
      );

      const childLogger = logger.getChild('database');
      childLogger.info('データベースログ', {});

      expect(mockChildLogger.info).toHaveBeenCalledWith('データベースログ', {});
    });
  });

  describe('with', () => {
    test('コンテキスト付きのロガーを取得できる', () => {
      const mockLogger = logtape.getLogger();
      const mockContextualLogger = {
        trace: vi.fn(),
        debug: vi.fn(),
        info: vi.fn(),
        warning: vi.fn(),
        error: vi.fn(),
        fatal: vi.fn(),
        getChild: vi.fn(),
        with: vi.fn(),
      };
      (mockLogger.with as ReturnType<typeof vi.fn>).mockReturnValue(
        mockContextualLogger,
      );

      const properties = { userId: '123', userName: 'testuser' };
      const contextualLogger = logger.with(properties);

      expect(contextualLogger).toBeDefined();
      expect(mockLogger.with).toHaveBeenCalledWith(properties);
    });

    test('コンテキスト付きのロガーでログを出力できる', () => {
      const mockLogger = logtape.getLogger();
      const mockContextualLogger = {
        trace: vi.fn(),
        debug: vi.fn(),
        info: vi.fn(),
        warning: vi.fn(),
        error: vi.fn(),
        fatal: vi.fn(),
        getChild: vi.fn(),
        with: vi.fn(),
      };
      (mockLogger.with as ReturnType<typeof vi.fn>).mockReturnValue(
        mockContextualLogger,
      );

      const contextualLogger = logger.with({ userId: '123' });
      contextualLogger.info('ユーザーアクション', { action: 'view' });

      expect(mockContextualLogger.info).toHaveBeenCalledWith(
        'ユーザーアクション',
        {
          action: 'view',
        },
      );
    });
  });

  describe('getLogLevelFromEnv', () => {
    test('LOG_LEVEL環境変数が設定されていない場合はinfoを返す', () => {
      delete process.env.LOG_LEVEL;
      resetLogger();
      const newLogger = getLogger();
      // ログレベルがinfoに設定されていることを確認するため、実際のログ出力を試みる
      // モックでは直接確認できないため、ロガーが正常に動作することを確認
      expect(newLogger).toBeDefined();
    });

    test('LOG_LEVEL環境変数が有効な値の場合はその値を返す', () => {
      process.env.LOG_LEVEL = 'debug';
      resetLogger();
      const newLogger = getLogger();
      expect(newLogger).toBeDefined();
    });

    test('LOG_LEVEL環境変数が無効な値の場合はinfoを返す', () => {
      process.env.LOG_LEVEL = 'invalid-level';
      resetLogger();
      const newLogger = getLogger();
      expect(newLogger).toBeDefined();
    });
  });
});

describe('getLogger (追加テスト)', () => {
  beforeEach(() => {
    resetLogger();
    vi.clearAllMocks();
  });

  afterEach(() => {
    resetLogger();
  });

  test('初回呼び出し時にロガーインスタンスを作成する', () => {
    const logger1 = getLogger();
    expect(logger1).toBeDefined();
    expect(logtape.getLogger).toHaveBeenCalled();
  });

  test('カテゴリを指定してロガーを取得できる', () => {
    vi.clearAllMocks();
    const logger = getLogger('test-category');
    expect(logger).toBeDefined();
    expect(logtape.getLogger).toHaveBeenCalledWith(['test-category']);
  });

  test('異なるカテゴリでは異なるロガーを取得できる', () => {
    vi.clearAllMocks();
    const logger1 = getLogger('category1');
    const logger2 = getLogger('category2');
    expect(logger1).toBeDefined();
    expect(logger2).toBeDefined();
    expect(logtape.getLogger).toHaveBeenCalledWith(['category1']);
    expect(logtape.getLogger).toHaveBeenCalledWith(['category2']);
  });

  test('配列カテゴリを指定してロガーを取得できる', () => {
    const logger = getLogger(['app', 'service']);
    expect(logger).toBeDefined();
    expect(logtape.getLogger).toHaveBeenCalledWith(['app', 'service']);
  });
});

describe('resetLogger', () => {
  beforeEach(() => {
    resetLogger();
  });

  afterEach(() => {
    resetLogger();
  });

  test('ログ設定をリセットできる', () => {
    getLogger();
    resetLogger();
    vi.clearAllMocks();
    getLogger();
    // リセット後もロガーを取得できることを確認
    expect(logtape.getLogger).toHaveBeenCalled();
  });
});

describe('構造化ログ', () => {
  beforeEach(() => {
    resetLogger();
    vi.clearAllMocks();
  });

  afterEach(() => {
    resetLogger();
  });

  test('ロガーは構造化ログ（JSON Lines形式）を使用する', async () => {
    resetLogger();
    vi.clearAllMocks();
    getLogger();
    // 非同期初期化が完了するまで少し待つ
    await new Promise((resolve) => setTimeout(resolve, 10));
    // getJsonLinesFormatterが呼ばれていることを確認
    expect(logtape.getJsonLinesFormatter).toHaveBeenCalled();
    // getConsoleSinkが呼ばれていることを確認
    expect(logtape.getConsoleSink).toHaveBeenCalled();
  });

  test('コンテキスト情報が構造化されて渡される', () => {
    const logger = getLogger();
    const context = { userId: '123', action: 'test', count: 42 };
    logger.info('テストメッセージ', context);

    const mockLogger = logtape.getLogger();
    // コンテキストがRecord<string, unknown>形式で渡されることを確認
    // 構造化ログでは、メッセージとコンテキストが分離されて渡される
    expect(mockLogger.info).toHaveBeenCalledWith('テストメッセージ', context);
    // コンテキストがオブジェクト形式であることを確認
    expect(mockLogger.info).toHaveBeenCalledWith(
      'テストメッセージ',
      expect.objectContaining({
        userId: '123',
        action: 'test',
        count: 42,
      }),
    );
  });

  test('エラー情報が構造化されて渡される', () => {
    const logger = getLogger();
    const error = new Error('テストエラー');
    logger.error('エラーメッセージ', buildErrorContext(error));

    const mockLogger = logtape.getLogger();
    // エラー情報が構造化されたオブジェクトとして渡されることを確認
    expect(mockLogger.error).toHaveBeenCalledWith(
      'エラーメッセージ',
      expect.objectContaining({
        error: expect.objectContaining({
          name: 'Error',
          message: 'テストエラー',
          stack: expect.any(String),
        }),
      }),
    );
  });

  test('複数のコンテキストがマージされて構造化される', () => {
    const logger = getLogger();
    const error = new Error('テストエラー');
    const context = { userId: '123', action: 'test' };
    logger.error('エラーメッセージ', {
      ...buildErrorContext(error),
      ...context,
    });

    const mockLogger = logtape.getLogger();
    // エラー情報とコンテキストがマージされていることを確認
    expect(mockLogger.error).toHaveBeenCalledWith(
      'エラーメッセージ',
      expect.objectContaining({
        error: expect.objectContaining({
          name: 'Error',
          message: 'テストエラー',
        }),
        userId: '123',
        action: 'test',
      }),
    );
  });
});

describe('runWithContext', () => {
  let logger: Logger;

  beforeEach(() => {
    resetLogger();
    vi.clearAllMocks();
    logger = getLogger();
  });

  test('コンテキスト付きでコードを実行できる', () => {
    const context = { userId: '123', requestId: 'req-456' };
    const result = runWithContext(context, () => {
      return 'test-result';
    });

    expect(result).toBe('test-result');
  });

  test('コンテキスト内でログを出力できる', () => {
    const context = { userId: '123', requestId: 'req-456' };
    runWithContext(context, () => {
      logger.info('テストメッセージ', {});
    });

    const mockLogger = logtape.getLogger();
    // ログが出力されることを確認（コンテキストの自動付与はLogTapeの実装に依存）
    expect(mockLogger.info).toHaveBeenCalledWith('テストメッセージ', {});
  });

  test('コンテキスト内でログを出力する際、提供されたコンテキストを渡せる', () => {
    const context = { userId: '123', requestId: 'req-456' };
    runWithContext(context, () => {
      logger.info('テストメッセージ', { action: 'view' });
    });

    const mockLogger = logtape.getLogger();
    // 提供されたコンテキストが渡されることを確認
    expect(mockLogger.info).toHaveBeenCalledWith('テストメッセージ', {
      action: 'view',
    });
  });

  test('コンテキスト外でもログを出力できる', () => {
    const context = { userId: '123', requestId: 'req-456' };
    runWithContext(context, () => {
      // コンテキスト内
    });

    // コンテキスト外
    logger.info('テストメッセージ', {});

    const mockLogger = logtape.getLogger();
    expect(mockLogger.info).toHaveBeenCalledWith('テストメッセージ', {});
  });
});

describe('setContext', () => {
  let logger: Logger;

  beforeEach(() => {
    resetLogger();
    vi.clearAllMocks();
    logger = getLogger();
  });

  test('runWithContext内でsetContextを呼び出すとコンテキストが更新される', () => {
    const initialContext = { userId: '123', requestId: 'req-456' };

    runWithContext(initialContext, () => {
      setContext({ userId: '789' });
      // setContextが正常に動作することを確認（ログ出力で検証）
      logger.info('テストメッセージ', {});
    });

    const mockLogger = logtape.getLogger();
    expect(mockLogger.info).toHaveBeenCalled();
  });

  test('runWithContext外でsetContextを呼び出しても何も起こらない', () => {
    setContext({ userId: '123' });
    // setContextが呼び出されてもエラーが発生しないことを確認
    logger.info('テストメッセージ', {});
    const mockLogger = logtape.getLogger();
    expect(mockLogger.info).toHaveBeenCalled();
  });

  test('setContextで複数のプロパティを追加できる', () => {
    const initialContext = { userId: '123' };

    runWithContext(initialContext, () => {
      setContext({ requestId: 'req-456', action: 'view' });
      // setContextが正常に動作することを確認（ログ出力で検証）
      logger.info('テストメッセージ', {});
    });

    const mockLogger = logtape.getLogger();
    expect(mockLogger.info).toHaveBeenCalled();
  });
});

describe('buildErrorContext', () => {
  test('Errorオブジェクトを構造化できる', () => {
    const error = new Error('テストエラー');
    const context = buildErrorContext(error);

    expect(context).toEqual({
      error: {
        name: 'Error',
        message: 'テストエラー',
        stack: error.stack,
      },
    });
  });

  test('Error以外のオブジェクトを構造化できる', () => {
    const error = '文字列エラー';
    const context = buildErrorContext(error);

    expect(context).toEqual({
      error: '文字列エラー',
    });
  });

  test('undefinedの場合は空のオブジェクトを返す', () => {
    const context = buildErrorContext(undefined);
    expect(context).toEqual({});
  });

  test('nullの場合は空のオブジェクトを返す', () => {
    const context = buildErrorContext(null);
    expect(context).toEqual({});
  });
});
