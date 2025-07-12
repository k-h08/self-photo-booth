#!/bin/bash

# Photo File Watcher 起動スクリプト

echo "Photo File Watcher を起動中..."

# 現在のディレクトリを確認
if [ ! -f "index.js" ]; then
    echo "エラー: index.js が見つかりません。"
    echo "file-watcher ディレクトリで実行してください。"
    exit 1
fi

# 依存関係をチェック
if [ ! -d "node_modules" ]; then
    echo "依存関係をインストール中..."
    npm install
fi

# 設定ファイルをチェック
if [ ! -f "config.json" ]; then
    echo "エラー: config.json が見つかりません。"
    echo "config.json.example をコピーして設定してください。"
    exit 1
fi

# 環境変数ファイルをチェック
if [ ! -f ".env" ]; then
    echo "警告: .env ファイルが見つかりません。"
    echo "環境変数を設定することをお勧めします。"
fi

# アプリケーションを起動
echo "ファイル監視を開始します..."
echo "停止するには Ctrl+C を押してください。"
echo ""

npm start 