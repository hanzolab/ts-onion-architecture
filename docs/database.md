# データベーススキーマ

このドキュメントでは、プロジェクトで使用するデータベーススキーマとインデックス戦略について説明します。

## データベース

- **データベース**: PostgreSQL
- **ORM**: Prisma
- **スキーマファイル**: `prisma/schema.prisma`

## テーブル構造

### User テーブル (`users`)

ユーザー情報を格納するテーブルです。

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| `id` | `String` | PRIMARY KEY | UUID v7（ドメインエンティティで生成） |
| `email` | `String` | UNIQUE | メールアドレス（Email Value Objectの値） |
| `name` | `String` | - | ユーザー名（Username Value Objectの値、3-50文字） |
| `createdAt` | `DateTime` | - | 作成日時（Temporal.Instantから変換） |
| `updatedAt` | `DateTime` | - | 更新日時（Temporal.Instantから変換） |

#### インデックス

- **`email`**: UNIQUE制約により自動的にインデックスが作成される
- **`name`**: B-treeインデックス（部分一致検索用）

### Todo テーブル (`todos`)

Todo情報を格納するテーブルです。

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| `id` | `String` | PRIMARY KEY | UUID v7（ドメインエンティティで生成） |
| `userId` | `String` | FOREIGN KEY | Userへの外部キー（CASCADE削除） |
| `title` | `String` | - | タイトル（TodoTitle Value Objectの値、1-200文字） |
| `body` | `String?` | - | 本文（TodoBody Value Objectの値、最大1000文字、空文字列も許可） |
| `status` | `TodoStatus` | - | ステータス（enum） |
| `createdAt` | `DateTime` | - | 作成日時（Temporal.Instantから変換） |
| `updatedAt` | `DateTime` | - | 更新日時（Temporal.Instantから変換） |

#### リレーション

- **`user`**: Userテーブルへの外部キー（`userId` → `users.id`）
  - `onDelete: Cascade` - Userが削除されると、関連するTodoも自動削除

#### インデックス

- **`userId`**: B-treeインデックス（ユーザーごとのTodo検索用）
- **`userId, status`**: 複合インデックス（ユーザーごとのステータス検索用）
- **`title`**: B-treeインデックス（タイトル検索用）

### TodoStatus Enum (`todo_status`)

Todoのステータスを表現するenumです。

| 値 | 説明 |
|-----|------|
| `NOT_STARTED` | 未着手 |
| `IN_PROGRESS` | 進行中 |
| `PENDING` | 保留中 |
| `COMPLETED` | 完了 |

## インデックス戦略

### インデックスの設計方針

1. **カーディナリティ**: 値の種類が多いフィールドにインデックスを設定
2. **クエリパターン**: 頻繁に使用されるWHERE句やORDER BYにインデックスを設定
3. **複合インデックス**: 複数の条件を組み合わせるクエリに有効
4. **書き込みコスト**: インデックスはINSERT/UPDATEのパフォーマンスに影響するため、必要最小限に

### 各インデックスの詳細

#### User テーブル

##### `email` (UNIQUE制約)

- **タイプ**: UNIQUE制約による自動インデックス
- **目的**: メールアドレスの一意性保証と高速検索
- **使用パターン**:
  ```sql
  SELECT * FROM users WHERE email = ?;
  ```

##### `name` (B-treeインデックス)

- **タイプ**: B-treeインデックス
- **目的**: ユーザー名の部分一致検索
- **使用パターン**:
  ```sql
  SELECT * FROM users WHERE name LIKE ?;
  SELECT * FROM users WHERE name ILIKE ?;  -- 大文字小文字を区別しない
  ```
- **注意**: 
  - 前方一致（`LIKE 'prefix%'` または `ILIKE 'prefix%'`）には有効
  - 中間一致や後方一致にはGINインデックス（trigram）の検討が必要
  - `ILIKE`を使用する場合、GINインデックス（trigram）が推奨

#### Todo テーブル

##### `userId` (B-treeインデックス)

- **タイプ**: B-treeインデックス
- **目的**: ユーザーごとのTodo検索
- **使用パターン**:
  ```sql
  SELECT * FROM todos WHERE userId = ?;
  ```

##### `userId, status` (複合インデックス)

- **タイプ**: 複合B-treeインデックス
- **目的**: ユーザーごとのステータス検索
- **使用パターン**:
  ```sql
  SELECT * FROM todos WHERE userId = ? AND status = ?;
  ```
- **注意**: カーディナリティが低い`status`単独ではインデックス効果が薄いが、`userId`と組み合わせることで有効

##### `title` (B-treeインデックス)

- **タイプ**: B-treeインデックス
- **目的**: タイトル検索（前方一致）
- **使用パターン**:
  ```sql
  SELECT * FROM todos WHERE title LIKE 'prefix%';
  SELECT * FROM todos WHERE title ILIKE 'prefix%';  -- 大文字小文字を区別しない
  SELECT * FROM todos WHERE userId = ? AND title ILIKE '%keyword%';
  ```
- **制限**: 
  - 前方一致（`LIKE 'prefix%'`）には有効
  - 中間一致（`LIKE '%middle%'`）や後方一致（`LIKE '%suffix'`）には効果が限定的
  - `ILIKE`を使用する場合、B-treeインデックスの効果は限定的
- **部分一致検索の推奨**: 
  - 中間一致や後方一致が必要な場合: GINインデックス（trigram）の追加を検討
  - `ILIKE`を使用する場合: GINインデックス（trigram）が推奨

### インデックスが設定されていないフィールド

#### `status` (単独)

- **理由**: カーディナリティが低い（4つの値のみ）ため、単独でのインデックス効果が限定的
- **代替**: `userId, status`の複合インデックスで対応

#### `createdAt`, `updatedAt`

- **理由**: 単独でのソートはデータ量が少ない場合は不要
- **推奨**: 必要に応じて`userId, createdAt`などの複合インデックスを検討
  ```prisma
  @@index([userId, createdAt(sort: Desc)])  // ユーザーごとの最新Todo取得用
  ```

## 命名規則

### テーブル名

- Prismaモデル名: PascalCase（`User`, `Todo`）
- データベーステーブル名: 複数形のsnake_case（`users`, `todos`）
- `@@map`ディレクティブでマッピング

### カラム名

- Prismaフィールド名: camelCase（`createdAt`, `updatedAt`）
- データベースカラム名: camelCase（Prismaのデフォルト）

## データ型の変換

### UUID

- **ドメイン**: `UserId`, `TodoId` (UUID v7)
- **データベース**: `String` (UUID文字列)
- **生成**: ドメインエンティティで生成（Prismaの`@default(uuid())`は使用しない）

### 日時

- **ドメイン**: `Temporal.Instant`
- **データベース**: `DateTime`
- **変換**: リポジトリ層で変換
  - ドメイン → DB: `new Date(temporal.epochMilliseconds)`
  - DB → ドメイン: `Temporal.Instant.from(date.toISOString())`

### Value Object

- **ドメイン**: `Email`, `Username`, `TodoTitle`, `TodoBody` (Value Object)
- **データベース**: `String`
- **変換**: リポジトリ層で`getValue()`を使用して文字列に変換

## pg_trgm拡張機能

### 概要

`pg_trgm`は、PostgreSQLの拡張機能の一つで、trigram（3文字のn-gram）を使用した全文検索を提供します。部分一致検索や類似度検索を高速化するために使用されます。

### 用途

`pg_trgm`は以下のような検索パターンで有効です：

- **中間一致検索**: `LIKE '%middle%'`
- **後方一致検索**: `LIKE '%suffix'`
- **大文字小文字を区別しない検索**: `ILIKE '%keyword%'`
- **類似度検索**: `similarity()`関数を使用したあいまい検索

### 対応する検索パターン

| 検索パターン | B-treeインデックス | GINインデックス（trigram） |
|-------------|-------------------|---------------------------|
| 前方一致（`LIKE 'prefix%'`） | ✅ 有効 | ✅ 有効 |
| 中間一致（`LIKE '%middle%'`） | ❌ 効果なし | ✅ 有効 |
| 後方一致（`LIKE '%suffix'`） | ❌ 効果なし | ✅ 有効 |
| ILIKE（`ILIKE '%keyword%'`） | ❌ 効果なし | ✅ 有効 |

### パフォーマンス上のメリットとデメリット

#### メリット

- 部分一致検索の高速化（特に中間一致・後方一致）
- `ILIKE`検索の高速化
- 類似度検索（`similarity`関数）の利用が可能
- あいまい検索に対応

#### デメリット

- **更新コスト**: GINインデックスは更新コストが高い（INSERT/UPDATEがやや遅くなる）
- **ストレージ使用量**: インデックスサイズが大きくなる（元のデータの数倍になることがある）
- **メモリ使用量**: 検索時のメモリ使用量が増える
- **初期作成コスト**: 既存のデータが多い場合、インデックスの作成に時間がかかる

### 使い分け

- **前方一致のみ**: B-treeインデックスで十分
- **中間一致・後方一致が必要**: GINインデックス（trigram）を検討
- **ILIKE検索が必要**: GINインデックス（trigram）を推奨
- **類似度検索が必要**: GINインデックス（trigram）が必須

## マイグレーション

### マイグレーションの実行

```bash
# マイグレーションファイルの生成
bunx prisma migrate dev --name migration_name

# 本番環境への適用
bunx prisma migrate deploy
```

### カスタムインデックスの追加

Prismaスキーマで直接定義できないインデックス（例: GINインデックス）は、マイグレーションファイルで手動追加します。

#### pg_trgm拡張機能とGINインデックスの導入

`name`や`title`フィールドで中間一致・後方一致検索、または`ILIKE`（大文字小文字を区別しない検索）が必要な場合、`pg_trgm`拡張機能を有効化し、GINインデックス（trigram）を追加します。

##### 新しいマイグレーションを作成する場合

1. マイグレーションファイルを生成：

```bash
bunx prisma migrate dev --create-only --name add_pg_trgm_gin_indexes
```

2. 生成されたマイグレーションファイル（`prisma/migrations/YYYYMMDDHHMMSS_add_pg_trgm_gin_indexes/migration.sql`）に以下を追加：

```sql
-- pg_trgm拡張機能を有効化（初回のみ、既に存在する場合はスキップ）
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- nameカラムにGINインデックスを追加（部分一致検索・ILIKE用）
CREATE INDEX IF NOT EXISTS users_name_gin_idx ON users USING gin (name gin_trgm_ops);

-- titleカラムにGINインデックスを追加（部分一致検索・ILIKE用）
CREATE INDEX IF NOT EXISTS todos_title_gin_idx ON todos USING gin (title gin_trgm_ops);
```

3. マイグレーションを適用：

```bash
bunx prisma migrate dev
```

##### 既存のマイグレーションに追加する場合

既存のマイグレーションファイルの最後に上記のSQLを追加します。既に拡張機能が有効化されている場合は、`CREATE EXTENSION IF NOT EXISTS pg_trgm;`はスキップされます。

##### SQLコマンドの説明

- **`CREATE EXTENSION IF NOT EXISTS pg_trgm`**: `pg_trgm`拡張機能を有効化します。`IF NOT EXISTS`により、既に存在する場合はエラーになりません。
- **`CREATE INDEX ... USING gin (... gin_trgm_ops)`**: GINインデックスを作成します。`gin_trgm_ops`はtrigram演算子クラスを指定します。
- **`IF NOT EXISTS`**: インデックスが既に存在する場合はエラーになりません（PostgreSQL 9.5以降）。

##### 注意事項

- データベースへのスーパーユーザー権限が必要な場合があります（拡張機能の作成には`CREATE`権限が必要）
- 既存のデータが多い場合、インデックスの作成に時間がかかります
- 本番環境では、メンテナンス時間帯での実行を推奨します
- マイグレーション実行前にデータベースのバックアップを取ることを推奨します

## pg_trgmを使ったクエリ方法

### Prisma Clientでのクエリ

Prisma Clientでは、`$queryRaw`を使用して`ILIKE`や`similarity`関数を使った検索を実行できます。

#### ILIKE検索の例

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// タイトルでILIKE検索（大文字小文字を区別しない）
const todos = await prisma.$queryRaw`
  SELECT * FROM todos 
  WHERE title ILIKE ${'%タスク%'}
  LIMIT 10
`;

// ユーザー名でILIKE検索
const users = await prisma.$queryRaw`
  SELECT * FROM users 
  WHERE name ILIKE ${'%john%'}
  LIMIT 10
`;

// パラメータ化クエリ（SQLインジェクション対策）
const searchTerm = '%keyword%';
const results = await prisma.$queryRaw`
  SELECT * FROM todos 
  WHERE title ILIKE ${searchTerm}
`;
```

#### 類似度検索の例（similarity関数）

```typescript
// 類似度が0.3以上のTodoを検索（降順）
const similarTodos = await prisma.$queryRaw`
  SELECT *, similarity(title, ${'タスク'}) AS similarity
  FROM todos
  WHERE similarity(title, ${'タスク'}) > 0.3
  ORDER BY similarity DESC
  LIMIT 10
`;

// ユーザー名の類似度検索
const similarUsers = await prisma.$queryRaw`
  SELECT *, similarity(name, ${'John'}) AS similarity
  FROM users
  WHERE similarity(name, ${'John'}) > 0.3
  ORDER BY similarity DESC
  LIMIT 10
`;
```

#### 型安全なクエリ結果の扱い

```typescript
// 型アノテーションを使用
interface TodoResult {
  id: string;
  userId: string;
  title: string;
  body: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const todos = await prisma.$queryRaw<TodoResult[]>`
  SELECT * FROM todos 
  WHERE title ILIKE ${'%タスク%'}
  LIMIT 10
`;
```

### 生SQLでのクエリ

直接SQLを実行する場合の例です。

#### ILIKE検索

```sql
-- タイトルでILIKE検索（大文字小文字を区別しない）
SELECT * FROM todos 
WHERE title ILIKE '%タスク%'
LIMIT 10;

-- ユーザー名でILIKE検索
SELECT * FROM users 
WHERE name ILIKE '%john%'
LIMIT 10;

-- 複合条件（ユーザーIDとタイトルの組み合わせ）
SELECT * FROM todos 
WHERE "userId" = 'user-id-here' 
  AND title ILIKE '%keyword%'
LIMIT 20;
```

#### 類似度検索（similarity関数）

```sql
-- 類似度が0.3以上のTodoを検索（降順）
SELECT *, similarity(title, 'タスク') AS similarity
FROM todos
WHERE similarity(title, 'タスク') > 0.3
ORDER BY similarity DESC
LIMIT 10;

-- ユーザー名の類似度検索
SELECT *, similarity(name, 'John') AS similarity
FROM users
WHERE similarity(name, 'John') > 0.3
ORDER BY similarity DESC
LIMIT 10;
```

#### 類似度の閾値について

`similarity()`関数は0.0から1.0の値を返します：

- **0.0**: 全く一致しない
- **1.0**: 完全に一致
- **推奨閾値**: 0.3以上で有効な結果が得られることが多い

### パフォーマンス最適化のヒント

1. **LIMIT句の使用**: 大量の結果を返さないように`LIMIT`を設定
2. **インデックスの確認**: `EXPLAIN ANALYZE`でインデックスが使用されているか確認
3. **類似度閾値の調整**: 必要に応じて類似度の閾値を調整（デフォルトは0.3）
4. **検索文字列の長さ**: 短すぎる検索文字列（1-2文字）ではtrigramの効果が薄い場合がある

### EXPLAIN ANALYZEでの確認

クエリの実行計画を確認して、インデックスが正しく使用されているか検証します。

```sql
-- 実行計画の確認
EXPLAIN ANALYZE
SELECT * FROM todos 
WHERE title ILIKE '%タスク%'
LIMIT 10;
```

インデックスが使用されている場合、`Bitmap Index Scan`または`Index Scan using todos_title_gin_idx`が表示されます。

## パフォーマンス考慮事項

1. **インデックスのメンテナンス**: インデックスは書き込みコストを増やすため、必要最小限に
2. **クエリパターンの監視**: 実際のクエリパターンに応じてインデックスを調整
3. **EXPLAIN ANALYZE**: クエリの実行計画を確認してインデックスの効果を検証
4. **GINインデックスの更新コスト**: INSERT/UPDATEが多い場合、パフォーマンスへの影響を考慮
5. **ストレージ容量**: GINインデックスはストレージ使用量が増えるため、容量を確保

## 参考資料

- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [PostgreSQL Indexes](https://www.postgresql.org/docs/current/indexes.html)
- [PostgreSQL pg_trgm Extension](https://www.postgresql.org/docs/current/pgtrgm.html)

