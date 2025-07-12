# Photo File Watcher

Mac 用の写真ファイル監視・アップロードツールです。指定したフォルダに新しい写真ファイルが追加されると、自動的に Supabase にアップロードします。

## 機能

- フォルダの自動監視
- 画像ファイルの自動アップロード
- 画像圧縮（オプション）
- セッション ID の自動抽出
- 詳細なログ出力
- エラーハンドリング

## セットアップ

### 1. 依存関係のインストール

```bash
cd file-watcher
npm install
```

### 2. 環境変数の設定

`.env`ファイルを作成し、以下の内容を設定してください：

```env
# Supabase設定（必須）
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# 監視フォルダ設定（config.jsonで上書き可能）
WATCH_FOLDER=/Users/k.hamashita/Desktop/Photos

# ログレベル
LOG_LEVEL=info
```

**重要**: Supabase の設定は必須です。以下の手順で取得してください：

1. Supabase プロジェクトのダッシュボードにアクセス
2. Settings > API で URL と service_role key を取得
3. 上記の形式で.env ファイルに設定

### 3. 設定ファイルの編集

`config.json`を編集して、監視フォルダやアップロード設定を調整してください：

**注意**: Supabase の設定は環境変数で行うことを推奨します。config.json の url と serviceRoleKey は空文字列のままにしてください。

**フォルダ自動作成**: 監視フォルダと退避フォルダが存在しない場合は自動的に作成されます。設定で無効にすることも可能です。

```json
{
	"supabase": {
		"url": "",
		"serviceRoleKey": "",
		"bucketName": "private-photos"
	},
	"watch": {
		"folder": "/Users/k.hamashita/Desktop/Photos",
		"stabilityThreshold": 2000,
		"pollInterval": 100,
		"ignoreCompressedFiles": true,
		"createFolderIfNotExists": true
	},
	"upload": {
		"maxFileSize": 10485760,
		"allowedExtensions": ["jpg", "jpeg", "png", "heic"],
		"compressImages": true,
		"compressQuality": 80,
		"autoDeleteAfterUpload": false,
		"moveToBackupFolder": true,
		"backupFolder": "/Users/k.hamashita/Desktop/Photos/uploaded",
		"createBackupFolderIfNotExists": true
	},
	"logging": {
		"level": "info",
		"file": "./file-watcher.log"
	},
	"session": {
		"extractFromFilename": true,
		"filenamePattern": "^(.+?)_"
	}
}
```

## 使用方法

### 開発モードで起動

```bash
npm run dev
```

### 本番モードで起動

```bash
npm start
```

### バックグラウンドで実行

```bash
nohup npm start > file-watcher.log 2>&1 &
```

## 設定オプション

### Supabase 設定

- `url`: Supabase プロジェクトの URL
- `serviceRoleKey`: Supabase のサービスロールキー
- `bucketName`: アップロード先のバケット名

### 監視設定

- `folder`: 監視するフォルダのパス
- `stabilityThreshold`: ファイル書き込み完了を待つ時間（ミリ秒、デフォルト: 2000）
- `pollInterval`: ファイル状態チェックの間隔（ミリ秒、デフォルト: 100）
- `ignoreCompressedFiles`: 圧縮ファイルを無視するかどうか（デフォルト: true）
- `createFolderIfNotExists`: 監視フォルダが存在しない場合に自動作成するかどうか（デフォルト: true）

### アップロード設定

- `maxFileSize`: 最大ファイルサイズ（バイト）
- `allowedExtensions`: 許可するファイル拡張子
- `compressImages`: 画像圧縮の有効/無効
- `compressQuality`: 圧縮品質（1-100）
- `autoDeleteAfterUpload`: アップロード後のファイル削除
- `moveToBackupFolder`: アップロード後のファイル退避（デフォルト: true）
- `backupFolder`: 退避先フォルダのパス
- `createBackupFolderIfNotExists`: 退避フォルダが存在しない場合に自動作成するかどうか（デフォルト: true）

### ログ設定

- `level`: ログレベル（error, warn, info, debug）
- `file`: ログファイルのパス

### セッション設定

- `extractFromFilename`: ファイル名からセッション ID を抽出するかどうか
- `filenamePattern`: セッション ID 抽出用の正規表現パターン

## ファイル名の規則

セッション ID を自動抽出する場合、ファイル名は以下の形式である必要があります：

```
{sessionId}_{filename}.{extension}
```

例：

- `abc123_photo_1.jpg`
- `xyz789_capture.png`

## ファイル退避機能

アップロード完了後、元のファイルは自動的に退避フォルダに移動されます。

### 退避ファイルの命名規則

```
{timestamp}_{original_filename}
```

例：

- `2025-07-12T12-00-30-123Z_abc123_photo_1.jpg`
- `2025-07-12T12-01-15-456Z_xyz789_capture.png`

### 退避フォルダの設定

- `moveToBackupFolder`: 退避機能の有効/無効
- `backupFolder`: 退避先フォルダのパス
- `createBackupFolderIfNotExists`: 退避フォルダの自動作成（デフォルト: true）

退避フォルダが存在しない場合は自動的に作成されます。

## ログ

ログは以下の場所に出力されます：

- コンソール: リアルタイムで表示
- ファイル: `file-watcher.log`（設定可能）

## トラブルシューティング

### 権限エラー

監視フォルダへのアクセス権限を確認してください：

```bash
ls -la /path/to/watch/folder
```

### Supabase 接続エラー

環境変数が正しく設定されているか確認してください：

```bash
echo $SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY
```

**よくあるエラー**:

- `Invalid URL`: SUPABASE_URL が正しい形式でない
- `Invalid API key`: SUPABASE_SERVICE_ROLE_KEY が正しくない

**解決方法**:

1. `.env`ファイルが正しい場所にあるか確認
2. Supabase ダッシュボードから正しい値をコピー
3. URL は `https://your-project.supabase.co` の形式であることを確認

### ファイル名エラー

**よくあるエラー**:

- `Invalid key`: ファイル名に日本語やスペースが含まれている
- 圧縮ファイルの無限ループ

**解決方法**:

1. ファイル名は英数字のみを使用
2. 圧縮ファイルは自動的に無視されるように設定済み
3. セッション ID はファイル名の先頭に `{sessionId}_` の形式で設定

### ファイル退避エラー

**よくあるエラー**:

- 退避フォルダへのアクセス権限がない
- 退避フォルダが存在しない

**解決方法**:

1. 退避フォルダのパスを確認
2. フォルダへの書き込み権限を確認
3. 必要に応じて手動でフォルダを作成

### ファイル監視エラー

フォルダが存在するか確認してください：

```bash
ls -la /path/to/watch/folder
```

## 自動起動設定（Mac）

### LaunchAgent を使用

1. `~/Library/LaunchAgents/com.photowatcher.plist`を作成：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.photowatcher</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/node</string>
        <string>/path/to/file-watcher/index.js</string>
    </array>
    <key>WorkingDirectory</key>
    <string>/path/to/file-watcher</string>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>/path/to/file-watcher/file-watcher.log</string>
    <key>StandardErrorPath</key>
    <string>/path/to/file-watcher/file-watcher.log</string>
</dict>
</plist>
```

2. LaunchAgent を登録：

```bash
launchctl load ~/Library/LaunchAgents/com.photowatcher.plist
```

## ライセンス

MIT License
