// LogTapeのLogger型を再エクスポート
export type { Logger } from '@logtape/logtape';
export {
  buildErrorContext,
  getLogger,
  type LogContext,
  resetLogger,
  runWithContext,
  setContext,
} from './logger';
