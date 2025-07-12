# フォトブースファイル監視ツール

Mac で特定のフォルダを監視して、撮影した写真ファイルを自動的に Supabase にアップロードするツールです。

## 機能

- 📁 フォルダ監視: 指定したフォルダの変更をリアルタイムで監視
- 📤 自動アップロード: 新しい画像ファイルを自動的に Supabase にアップロード
- 🖼️ 画像圧縮: 必要に応じて画像を圧縮してストレージ容量を節約
- 📊 ログ機能: 詳細なログをファイルとコンソールに出力
- ⚙️ 設定管理: 環境変数と JSON 設定ファイルで柔軟な設定
- 🔧 CLI ツール: コマンドラインから簡単に操作

## インストール

```bash
cd file-watcher
npm install
```

## 設定

### 1. 環境変数の設定

`.env`ファイルを作成して以下の設定を行います：

```env
# Supabase設定
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
BUCKET_NAME=private-photos

# 監視設定
WATCH_FOLDER=/path/to/your/photo/folder

# アップロード設定
MAX_FILE_SIZE=10485760
ALLOWED_EXTENSIONS=jpg,jpeg,png,heic
COMPRESS_IMAGES=true
COMPRESS_QUALITY=80

# ログ設定
LOG_LEVEL=info
LOG_FILE=./file-watcher.log
```

### 2. 初期設定ファイルの作成

```bash
node cli.js config --init
```

これで`config.json`ファイルが作成されます。必要に応じて編集してください。

## 使用方法

### 基本的な使用方法

```bash
# ファイル監視を開始
node cli.js start

# 設定ファイルを指定して開始
node cli.js start --config ./config.json

# 監視フォルダを指定して開始
node cli.js start --folder /path/to/folder
```

### 設定管理

```bash
# 設定を表示
node cli.js config --list

# 設定値を取得
node cli.js config --get watch.folder

# 設定値を設定
node cli.js config --set watch.folder=/new/path

# 初期設定ファイルを作成
node cli.js config --init
```

### 接続テスト

```bash
# 設定と接続をテスト
node cli.js test
```

## 設定オプション

### Supabase 設定

- `SUPABASE_URL`: Supabase プロジェクトの URL
- `SUPABASE_SERVICE_ROLE_KEY`: サービスロールキー（推奨）またはアノニマスキー
- `BUCKET_NAME`: ストレージバケット名

### 監視設定

- `WATCH_FOLDER`: 監視するフォルダのパス
- `MAX_FILE_SIZE`: 最大ファイルサイズ（バイト）
- `ALLOWED_EXTENSIONS`: 許可するファイル拡張子（カンマ区切り）

### アップロード設定

- `COMPRESS_IMAGES`: 画像圧縮の有効/無効
- `COMPRESS_QUALITY`: 圧縮品質（1-100）
- `AUTO_DELETE`: アップロード後のローカルファイル削除

### ログ設定

- `LOG_LEVEL`: ログレベル（debug, info, warn, error）
- `LOG_FILE`: ログファイルのパス
- `LOG_CONSOLE`: コンソール出力の有効/無効

## 動作の流れ

1. **監視開始**: 指定されたフォルダの監視を開始
2. **ファイル検出**: 新しい画像ファイルが検出される
3. **ファイル検証**: サイズと拡張子をチェック
4. **画像圧縮**: 設定に応じて画像を圧縮
5. **アップロード**: Supabase ストレージにアップロード
6. **セッション保存**: データベースにセッション情報を保存
7. **ログ出力**: 処理結果をログに記録

## ログファイル

ログは以下の形式で記録されます：

```
[2024-01-01T12:00:00.000Z] [INFO] ファイル監視を開始: /path/to/folder
[2024-01-01T12:00:05.000Z] [INFO] 新しいファイルを検出: /path/to/folder/photo1.jpg
[2024-01-01T12:00:06.000Z] [INFO] ファイルを処理中: /path/to/folder/photo1.jpg
[2024-01-01T12:00:08.000Z] [SUCCESS] ファイルアップロード成功: photo1.jpg -> session123/photo1.jpg
```

## トラブルシューティング

### よくある問題

1. **フォルダが見つからない**

   - 監視フォルダのパスが正しいか確認
   - フォルダの権限を確認

2. **Supabase 接続エラー**

   - URL とキーが正しいか確認
   - ネットワーク接続を確認

3. **ファイルアップロードエラー**
   - ファイルサイズが制限内か確認
   - ファイル形式がサポートされているか確認

### デバッグ

```bash
# デバッグログを有効にして開始
LOG_LEVEL=debug node cli.js start

# 設定テストを実行
node cli.js test
```

## システム要件

- Node.js 18 以上
- macOS（他の OS でも動作可能）
- インターネット接続

## ライセンス

MIT License
