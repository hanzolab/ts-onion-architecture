/**
 * TodoStatus Value Object
 * Todoのステータスを表現する定数オブジェクト
 */
export const TodoStatus = {
  NOT_STARTED: 'NOT_STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
} as const;

/**
 * TodoStatus型
 */
export type TodoStatus = (typeof TodoStatus)[keyof typeof TodoStatus];
