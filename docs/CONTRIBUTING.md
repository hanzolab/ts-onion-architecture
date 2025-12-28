# コントリビューションガイド

## 目次

- [コミットメッセージ規約](#コミットメッセージ規約)
  - [基本フォーマット](#基本フォーマット)
  - [コミットタイプ](#コミットタイプ)
  - [スコープ（オプション）](#スコープオプション)
  - [説明](#説明)
  - [本文（オプション）](#本文オプション)
  - [フッター（オプション）](#フッターオプション)
  - [コミットメッセージの検証](#コミットメッセージの検証)
  - [コミットメッセージの例](#コミットメッセージの例)
  - [参考資料](#参考資料)
- [Pre-commit フック](#pre-commit-フック)
  - [自動実行されるチェック](#自動実行されるチェック)
  - [チェックが失敗した場合](#チェックが失敗した場合)
  - [フックをスキップする（非推奨）](#フックをスキップする非推奨)
  - [ローカルでの手動チェック](#ローカルでの手動チェック)
- [ブランチ戦略](#ブランチ戦略)
  - [ブランチの種類](#ブランチの種類)
  - [ブランチ運用フロー](#ブランチ運用フロー)
  - [プルリクエストのガイドライン](#プルリクエストのガイドライン)
  - [ブランチの削除](#ブランチの削除)

## コミットメッセージ規約

このプロジェクトでは、コミットメッセージに [Conventional Commits](https://www.conventionalcommits.org/) 仕様を採用しています。

### 基本フォーマット

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### コミットタイプ

| タイプ     | 説明                                                         | 例                                      |
| ---------- | ------------------------------------------------------------ | --------------------------------------- |
| `feat`     | 新機能の追加                                                 | `feat: add user authentication`         |
| `fix`      | バグ修正                                                     | `fix: resolve login validation issue`   |
| `docs`     | ドキュメントの変更                                           | `docs: update API documentation`        |
| `style`    | コードの意味に影響しない変更（空白、フォーマット）           | `style: format code with prettier`      |
| `refactor` | バグ修正や機能追加を伴わないコード変更                       | `refactor: simplify user service logic` |
| `perf`     | パフォーマンスを向上させるコード変更                         | `perf: optimize database queries`       |
| `test`     | テストの追加や修正                                           | `test: add unit tests for user service` |
| `chore`    | ビルドプロセスや補助ツールの変更                             | `chore: update dependencies`            |

### スコープ（オプション）

コミットのスコープを指定できます：

```
feat(auth): add JWT token validation
fix(api): resolve user endpoint error
docs(readme): update installation guide
```

### 説明

- 現在形を使用（✅ "add", ❌ "added"）
- 小文字で始める
- 末尾にピリオドを付けない
- 50文字以内を推奨

### 本文（オプション）

より詳細な説明が必要な場合：

```
feat: add user authentication

- Implement JWT token generation
- Add password hashing with bcrypt
- Create login/logout endpoints
```

### フッター（オプション）

関連するissueや破壊的変更を参照：

```
feat: add new API endpoint

Closes #123
BREAKING CHANGE: API response format has changed
```

### コミットメッセージの検証

このプロジェクトでは [commitlint](https://commitlint.js.org/) を使用してコミットメッセージのフォーマットを自動的に検証します。不正なフォーマットのコミットメッセージは拒否されます。

### コミットメッセージの例

```
feat: add user registration endpoint
fix(auth): resolve token expiration issue
docs: update API documentation
refactor: simplify database connection logic
test: add integration tests for user service
```

### 参考資料

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Angular Commit Message Guidelines](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#-commit-message-format)

## Pre-commit フック

このプロジェクトでは、コミット前に自動的にコード品質チェックを実行するため、[Husky](https://typicode.github.io/husky/) と [lint-staged](https://github.com/okonet/lint-staged) を使用しています。

### 自動実行されるチェック

`git commit` を実行すると、以下のチェックが自動的に実行されます：

#### 1. コードフォーマットとリント

ステージされたファイル（`*.{ts,tsx,js,jsx,json}`）に対して [Biome](https://biomejs.dev/) によるフォーマットとリントが実行されます。

- コードスタイルの自動修正
- リントエラーの検出と修正
- インポート文の自動整理

#### 2. 型チェック

プロジェクト全体に対して TypeScript の型チェック（`tsc --noEmit`）が実行されます。

- 型エラーの検出
- 型安全性の確保

#### 3. コミットメッセージの検証

[commitlint](https://commitlint.js.org/) により、コミットメッセージが Conventional Commits 規約に従っているかチェックされます。

### チェックが失敗した場合

いずれかのチェックが失敗すると、コミットは中断されます：

```bash
# フォーマット・リントエラーの場合
✖ bunx biome format --write
✖ bunx biome lint
# → ステージされたファイルが自動修正されます。再度 git add してコミットしてください。

# 型エラーの場合
✖ bun run ci:typecheck
# → エラーメッセージを確認し、型エラーを修正してください。

# コミットメッセージエラーの場合
✖ commitlint
# → コミットメッセージを Conventional Commits 規約に従って修正してください。
```

### フックをスキップする（非推奨）

緊急時など、どうしても必要な場合に限り、`--no-verify` オプションでフックをスキップできます：

```bash
git commit --no-verify -m "emergency fix"
```

⚠️ **注意**: 品質チェックをスキップすることは推奨されません。コードベースの品質を維持するため、通常はフックを実行してください。

### ローカルでの手動チェック

コミット前に手動でチェックを実行することもできます：

```bash
# フォーマット
bun run format

# リント
bun run lint

# フォーマット + リント + 型チェック（CI用）
bun run ci:check

# 型チェックのみ
bun run ci:typecheck
```

## ブランチ戦略

### ブランチの種類

このプロジェクトでは以下のブランチ戦略を採用しています：

#### main ブランチ

- 本番環境にデプロイ可能な状態を常に保つ
- 直接プッシュは禁止
- プルリクエストを通じてのみマージ可能

#### develop ブランチ

- 開発中の最新コードを統合するブランチ
- 次回リリースに含まれる機能を集約
- 直接プッシュは禁止

#### feature ブランチ

新機能の開発用ブランチ

**命名規則：** `feature/機能名` または `feature/issue番号-機能名`

**例：**
```
feature/user-authentication
feature/123-add-payment-api
```

**運用：**
- `develop` ブランチから分岐
- 開発完了後、`develop` にマージ
- マージ後は削除

#### fix ブランチ

バグ修正用ブランチ

**命名規則：** `fix/修正内容` または `fix/issue番号-修正内容`

**例：**
```
fix/login-validation-error
fix/456-resolve-memory-leak
```

**運用：**
- `develop` ブランチから分岐
- 修正完了後、`develop` にマージ
- マージ後は削除

#### hotfix ブランチ

本番環境の緊急バグ修正用ブランチ

**命名規則：** `hotfix/修正内容` または `hotfix/issue番号-修正内容`

**例：**
```
hotfix/critical-security-patch
hotfix/789-fix-payment-error
```

**運用：**
- `main` ブランチから分岐
- 修正完了後、`main` と `develop` の両方にマージ
- マージ後は削除

### ブランチ運用フロー

#### 1. 新機能開発の場合

```bash
# develop ブランチから最新を取得
git switch develop
git pull origin develop

# feature ブランチを作成
git switch -c feature/new-feature

# 開発・コミット
git add .
git commit -m "feat: add new feature"

# リモートにプッシュ
git push origin feature/new-feature

# プルリクエストを作成（develop へマージ）
```

#### 2. バグ修正の場合

```bash
# develop ブランチから最新を取得
git switch develop
git pull origin develop

# fix ブランチを作成
git switch -c fix/bug-name

# 修正・コミット
git add .
git commit -m "fix: resolve bug"

# リモートにプッシュ
git push origin fix/bug-name

# プルリクエストを作成（develop へマージ）
```

#### 3. 緊急修正の場合

```bash
# main ブランチから最新を取得
git switch main
git pull origin main

# hotfix ブランチを作成
git switch -c hotfix/critical-issue

# 修正・コミット
git add .
git commit -m "fix: resolve critical issue"

# リモートにプッシュ
git push origin hotfix/critical-issue

# プルリクエストを作成（main と develop の両方へマージ）
```

### プルリクエストのガイドライン

#### プルリクエスト作成時

- **タイトル**: コミットメッセージ規約に従う
- **説明**: 変更内容、理由、影響範囲を明記
- **関連Issue**: `Closes #123` などで関連Issueを参照
- **レビュワー**: 適切なレビュワーをアサイン

#### レビュー基準

- コードがプロジェクトの規約に従っているか
- テストが適切に追加されているか
- ドキュメントが必要に応じて更新されているか
- CI/CDパイプラインが正常に完了しているか

#### マージ条件

- 最低1人以上の承認
- すべてのCIチェックが成功
- コンフリクトが解消されている

### ブランチの削除

マージ後は速やかにリモートブランチを削除してください：

```bash
# リモートブランチの削除
git push origin --delete feature/branch-name

# ローカルブランチの削除
git branch -d feature/branch-name
```
