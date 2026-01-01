# Onion Archietecture with Hono🔥

TypeScript + Hono を使用したオニオンアーキテクチャーのプロジェクトテンプレート

## 特徴

- 🔥 **Hono** - 軽量で高速な Web フレームワーク
- 🏗️ **オニオンアーキテクチャー** - ドメイン駆動設計（DDD）の原則に基づいた設計
- 📝 **TypeScript** - 型安全な開発体験
- ⚡ **Bun** - 高速なランタイムとパッケージマネージャー
- 🎨 **Biome** - 高速なリンター・フォーマッター
- 🔒 **Commitlint** - コミットメッセージの規約チェック
- 🐕 **Husky** - Git フックによる自動チェック

## 必要要件

- [Bun](https://bun.sh/) v1.0 以降

## セットアップ

### インストール

```bash
bun install
```

## 使い方

### 開発サーバーの起動

```bash
bun run dev
```

開発サーバーが起動し、ホットリロードが有効になります。

### ビルド

```bash
bun run build
```

ビルド成果物は `dist/` ディレクトリに出力されます。

### コード品質チェック

```bash
# フォーマット
bun run format

# リント
bun run lint

# 型チェック
bun run ci:typecheck

# フォーマットチェック + リント + 型チェック（CI用）
bun run ci:check
```

## プロジェクト構成

```
ts-onion-architecture/
├── src/
│   └── index.ts          # エントリーポイント
├── docs/
│   └── CONTRIBUTING.md   # コントリビューションガイド
├── biome.json            # Biome 設定
├── tsconfig.json         # TypeScript 設定
└── package.json          # プロジェクト設定
```

## コントリビューション

プロジェクトへの貢献を歓迎します！詳細は [CONTRIBUTING.md](docs/CONTRIBUTING.md) をご覧ください。

### 開発フロー

1. このリポジトリをフォーク
2. feature ブランチを作成 (`git switch -c feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'feat: add amazing feature'`)
4. ブランチをプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 技術スタック

- **ランタイム**: [Bun](https://bun.sh/)
- **フレームワーク**: [Hono](https://hono.dev/)
- **言語**: [TypeScript](https://www.typescriptlang.org/)
- **リンター/フォーマッター**: [Biome](https://biomejs.dev/)
- **コミット規約**: [Conventional Commits](https://www.conventionalcommits.org/)
