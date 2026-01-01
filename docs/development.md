# 開発ガイド

このドキュメントでは、プロジェクトの開発環境のセットアップ方法、利用可能なコマンド、デバッグ方法、CI/CDについて説明します。

## 1. 環境構築

### Requirements
- Bun version: `1.3.4+`
- Docker

## 2. セットアップ

### 2.1. 依存関係の解決

```bash
bun install
```

### 2.2. 環境変数の設定

`.env` を作成し、必要な設定を追加する。

```bash
cp .env.template .env
```

### 2.3. DBマイグレーション

#### 2.3.1. PostgreSQLを起動

```bash
docker compose up -d
```

#### 2.3.2. マイグレーションを実行

```bash
bun run db:migrate
```

### 2.4. APIを起動

```bash
bun run dev
```

## コマンド

### 開発

- `bun run dev`        # 開発サーバー起動（ホットリロード有効）
- `bun run build`      # ビルド実行
- `bun run start`      # ビルド済みアプリケーションを起動

### テスト

- `bun run test`       # テスト実行（ウォッチモード）
- `bun run test:run`   # テスト実行（一度のみ）
- `bun run test:coverage` # カバレッジ付きテスト実行

### コード品質

- `bun run lint`       # リントチェック
- `bun run format`     # コードフォーマット
- `bun run check:format` # フォーマットチェック（修正なし）
- `bun run ci:typecheck` # TypeScript型チェック
- `bun run ci:check`   # フォーマット + リント + 型チェック（CI同等）

## デバッグ

### 型エラーの解決

TypeScriptの型エラーが発生した場合：

```bash
# 型チェックのみ実行
bun run ci:typecheck
```

型エラーの詳細が表示されるため、エラーメッセージを確認して修正してください。

### よくあるエラー

- **依存関係のエラー**: `bun install`を再実行
- **型エラー**: `bun run ci:typecheck`で詳細を確認
- **フォーマットエラー**: `bun run format`で自動修正

## CI

### CI で実行されるジョブ

GitHub Actionsでは以下のチェックが自動実行されます：

1. 依存関係のインストール
2. フォーマットチェック + リント + 型チェック（`bun run ci:check`）
3. ビルド（`bun run build`）

### ローカルで再現する方法

CIと同じチェックをローカルで実行：

```bash
bun run ci:check
bun run build
```

### 失敗時の切り分け

CIが失敗した場合、上記コマンドをローカルで実行してエラーを確認してください。各ステップを個別に実行することも可能です：

```bash
# フォーマットチェック
bun run check:format

# リントチェック
bun run lint

# 型チェック
bun run ci:typecheck
```