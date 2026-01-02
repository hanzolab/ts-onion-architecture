/**
 * ロガーの使用例
 * このファイルは例示用です。実際のプロジェクトでは削除してください。
 */

import { buildErrorContext, getLogger, runWithContext } from './logger';

// ルートロガーを取得
const logger = getLogger();

// 基本的なログ出力
logger.info('アプリケーションが起動しました');
logger.debug('デバッグ情報', { userId: '123', action: 'login' });
logger.warn('警告メッセージ', { resource: 'user', id: '456' });

// エラーログ
try {
  throw new Error('サンプルエラー');
} catch (error) {
  logger.error('エラーが発生しました', {
    ...buildErrorContext(error),
    context: 'example',
    timestamp: new Date().toISOString(),
  });
}

// サブカテゴリのロガー
const dbLogger = getLogger('database');
dbLogger.info('データベース接続を開始しました');
dbLogger.debug('クエリを実行', { query: 'SELECT * FROM users' });

// コンテキスト付きのロガー
const userLogger = logger.with({ userId: '789', userName: 'testuser' });
userLogger.info('ユーザーアクション', { action: 'view' });
userLogger.info('別のアクション', { action: 'edit' });

// ミドルウェアでのコンテキスト注入の例
runWithContext({ requestId: 'req-123', userId: '456' }, () => {
  logger.info('リクエスト処理開始'); // requestId と userId が自動的に付与される
});
