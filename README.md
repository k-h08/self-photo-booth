# Self Photo Booth

セルフフォトブースアプリケーションです。Next.js、Prisma、Supabase を使用して構築されています。

## 機能

- フォトセッション管理
- カメラ機能
- 管理者パネル
- QR コード生成
- 写真ダウンロード
- ファイル監視・自動アップロード（Mac 用）

## 前提条件

- Node.js (v18 以上)
- npm または pnpm
- PostgreSQL データベース
- Supabase アカウント

## セットアップ

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd self-photo-booth
```

### 2. 依存関係のインストール

```bash
npm install
# または
pnpm install
```

### 3. 環境変数の設定

プロジェクトルートに `.env.local` ファイルを作成し、以下の環境変数を設定してください：

```env
# データベース設定
DATABASE_URL="postgresql://username:password@localhost:5432/your_database"

# Supabase設定
NEXT_PUBLIC_SUPABASE_URL="your_supabase_url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key"
```

### 4. データベースのセットアップ

Prisma を使用してデータベースをセットアップします：

```bash
# Prismaクライアントの生成
npx prisma generate

# データベースマイグレーションの実行
npx prisma migrate dev

# データベースの確認（オプション）
npx prisma studio
```

### 5. 開発サーバーの起動

```bash
npm run dev
# または
pnpm dev
```

アプリケーションは `http://localhost:3000` で起動します。

## 利用可能なスクリプト

- `npm run dev` - 開発サーバーを起動
- `npm run build` - プロダクションビルドを作成
- `npm run start` - プロダクションモードでサーバーを起動
- `npm run lint` - ESLint でコードをチェック

## プロジェクト構造

```
self-photo-booth/
├── app/                    # Next.js App Router
│   ├── admin/             # 管理者ページ
│   ├── api/               # API ルート
│   ├── camera/            # カメラページ
│   ├── complete/          # 完了ページ
│   ├── download/          # ダウンロードページ
│   └── start/             # 開始ページ
├── components/            # React コンポーネント
├── file-watcher/          # ファイル監視・アップロードツール
│   ├── index.js           # メインスクリプト
│   ├── config.json        # 設定ファイル
│   ├── package.json       # 依存関係
│   └── README.md          # 使用方法
├── lib/                   # ユーティリティライブラリ
├── prisma/                # データベーススキーマ
└── public/                # 静的ファイル
```

## 技術スタック

- **フロントエンド**: Next.js 15, React 18, TypeScript
- **スタイリング**: Tailwind CSS, Radix UI
- **データベース**: PostgreSQL (Prisma ORM)
- **認証・ストレージ**: Supabase
- **その他**: React Hook Form, Zod, Lucide React

## トラブルシューティング

### データベース接続エラー

- `DATABASE_URL` が正しく設定されているか確認
- PostgreSQL サーバーが起動しているか確認

### Supabase 接続エラー

- `NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_ANON_KEY` が正しく設定されているか確認
- Supabase プロジェクトが作成されているか確認

### QR コード関連

- ローカル環境では `http://localhost:3000` でアクセスしてください
- QR コードは `http://localhost:3000/download/[sessionId]` の形式で生成されます
- スマートフォンで QR コードをスキャンする際は、同じ WiFi ネットワークに接続されていることを確認してください
- ローカル環境での QR コードテストには、同じネットワーク内のデバイスを使用してください

### 依存関係エラー

```bash
# node_modulesを削除して再インストール
rm -rf node_modules
npm install
```

## ファイル監視ツール

Mac 用のファイル監視・アップロードツールが含まれています。

### セットアップ

```bash
cd file-watcher
npm install
```

### 設定

1. `config.json`で監視フォルダを設定
2. `.env`ファイルで Supabase 認証情報を設定
3. 必要に応じてアップロード設定を調整

### 使用方法

```bash
# 開発モード
npm run dev

# 本番モード
npm start

# 簡単起動
./start.sh
```

詳細な使用方法は `file-watcher/README.md` を参照してください。

## ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。
