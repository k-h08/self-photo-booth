#!/usr/bin/env node

import chokidar from "chokidar";
import { createClient } from "@supabase/supabase-js";
import { nanoid } from "nanoid";
import sharp from "sharp";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// 環境変数の読み込み
dotenv.config();

console.log("SUPABASE_URL:", process.env.SUPABASE_URL);
console.log("WATCH_FOLDER:", process.env.WATCH_FOLDER);

const config = {
	supabaseUrl: process.env.SUPABASE_URL,
	supabaseKey:
		process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY,
	bucketName: process.env.BUCKET_NAME || "private-photos",
	watchFolder: process.env.WATCH_FOLDER,
	maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
	allowedExtensions: (
		process.env.ALLOWED_EXTENSIONS || "jpg,jpeg,png,heic"
	).split(","),
	compressImages: process.env.COMPRESS_IMAGES === "true",
	compressQuality: parseInt(process.env.COMPRESS_QUALITY) || 80,
	logLevel: process.env.LOG_LEVEL || "info",
	logFile: process.env.LOG_FILE || "./file-watcher.log",
};

console.log("config:", config);

// Supabaseクライアントの初期化
const supabase =
	config.supabaseUrl && config.supabaseKey
		? createClient(config.supabaseUrl, config.supabaseKey)
		: null;

// ログ関数
function log(level, message, data = null) {
	const timestamp = new Date().toISOString();
	const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

	console.log(logMessage);
	if (data) {
		console.log(JSON.stringify(data, null, 2));
	}

	// ファイルにもログを記録
	fs.appendFile(config.logFile, logMessage + "\n").catch((err) => {
		console.error("ログファイル書き込みエラー:", err);
	});
}

// ファイル拡張子のチェック
function isAllowedFile(filename) {
	const ext = path.extname(filename).toLowerCase().slice(1);
	return config.allowedExtensions.includes(ext);
}

function isDummy(val) {
	return !val || val.startsWith("your_");
}

// 画像の圧縮
async function compressImage(inputPath, outputPath) {
	try {
		await sharp(inputPath)
			.jpeg({ quality: config.compressQuality })
			.toFile(outputPath);
		return true;
	} catch (error) {
		log("error", "画像圧縮エラー:", error);
		return false;
	}
}

// ファイルのアップロード
async function uploadFile(filePath, sessionId = null) {
	try {
		const stats = await fs.stat(filePath);

		// ファイルサイズチェック
		if (stats.size > config.maxFileSize) {
			log(
				"warn",
				`ファイルサイズが大きすぎます: ${filePath} (${stats.size} bytes)`
			);
			return false;
		}

		// ファイル拡張子チェック
		if (!isAllowedFile(filePath)) {
			log("warn", `サポートされていないファイル形式: ${filePath}`);
			return false;
		}

		log("info", `ファイルを処理中: ${filePath}`);

		let uploadPath = filePath;
		let fileName = path.basename(filePath);

		// 画像圧縮が必要な場合
		if (
			config.compressImages &&
			path.extname(filePath).toLowerCase() !== ".heic"
		) {
			const tempPath = filePath.replace(/\.[^/.]+$/, "_compressed.jpg");
			const compressed = await compressImage(filePath, tempPath);
			if (compressed) {
				uploadPath = tempPath;
				fileName = path.basename(tempPath);
			}
		}

		// セッションIDの生成（指定されていない場合）
		const finalSessionId = sessionId || nanoid();

		// Supabaseにアップロード
		if (!supabase) {
			log("error", "Supabaseクライアントが初期化されていません");
			return false;
		}

		const fileBuffer = await fs.readFile(uploadPath);
		const { data, error } = await supabase.storage
			.from(config.bucketName)
			.upload(`${finalSessionId}/${fileName}`, fileBuffer, {
				contentType: "image/jpeg",
				upsert: true,
			});

		if (error) {
			log("error", "Supabaseアップロードエラー:", error);
			return false;
		}

		log(
			"info",
			`ファイルアップロード成功: ${fileName} -> ${finalSessionId}/${fileName}`
		);

		// 圧縮ファイルを削除
		if (uploadPath !== filePath) {
			await fs.unlink(uploadPath);
		}

		// セッション情報をデータベースに保存
		if (supabase) {
			try {
				const { error: dbError } = await supabase.from("PhotoSession").upsert({
					sessionId: finalSessionId,
					photoFileNames: [fileName],
					createdAt: new Date().toISOString(),
				});

				if (dbError) {
					log("error", "データベース保存エラー:", dbError);
				} else {
					log("info", `セッション情報を保存: ${finalSessionId}`);
				}
			} catch (dbError) {
				log("error", "データベース操作エラー:", dbError);
			}
		}

		return { success: true, sessionId: finalSessionId, fileName };
	} catch (error) {
		log("error", "ファイル処理エラー:", error);
		return false;
	}
}

// ファイル監視の開始
function startWatching(customConfig = null) {
	const finalConfig = customConfig || config;

	if (!finalConfig.watchFolder) {
		log(
			"error",
			"監視フォルダが設定されていません。WATCH_FOLDER環境変数を設定してください。"
		);
		process.exit(1);
	}

	if (!finalConfig.supabaseUrl || !finalConfig.supabaseKey) {
		log(
			"error",
			"Supabase設定が不完全です。SUPABASE_URLとSUPABASE_KEYを設定してください。"
		);
		process.exit(1);
	}

	log("info", `ファイル監視を開始: ${finalConfig.watchFolder}`);
	log(
		"info",
		`設定: バケット=${finalConfig.bucketName}, 圧縮=${finalConfig.compressImages}, 品質=${finalConfig.compressQuality}`
	);

	const watcher = chokidar.watch(finalConfig.watchFolder, {
		ignored: /(^|[\/\\])\../, // 隠しファイルを無視
		persistent: true,
		awaitWriteFinish: {
			stabilityThreshold: 2000,
			pollInterval: 100,
		},
	});

	// ファイル追加イベント
	watcher.on("add", async (filePath) => {
		log("info", `新しいファイルを検出: ${filePath}`);

		// 少し待ってから処理（ファイルの書き込み完了を待つ）
		setTimeout(async () => {
			const result = await uploadFile(filePath);
			if (result && result.success) {
				log(
					"success",
					`ファイル処理完了: ${result.fileName} (セッション: ${result.sessionId})`
				);
			}
		}, 1000);
	});

	// ファイル変更イベント
	watcher.on("change", async (filePath) => {
		log("info", `ファイル変更を検出: ${filePath}`);
	});

	// エラーイベント
	watcher.on("error", (error) => {
		log("error", "ファイル監視エラー:", error);
	});

	// 準備完了
	watcher.on("ready", () => {
		log("info", "ファイル監視システムが準備完了しました");
		log(
			"info",
			"新しい画像ファイルを監視フォルダに配置すると自動的にアップロードされます"
		);
	});

	return watcher;
}

// シグナルハンドリング
process.on("SIGINT", () => {
	log("info", "ファイル監視を停止中...");
	process.exit(0);
});

process.on("SIGTERM", () => {
	log("info", "ファイル監視を停止中...");
	process.exit(0);
});

// メイン処理
if (import.meta.url === `file://${process.argv[1]}`) {
	log("info", "フォトブースファイル監視ツールを起動中...");
	startWatching();
}

export { startWatching };
