const chokidar = require("chokidar");
const { createClient } = require("@supabase/supabase-js");
const sharp = require("sharp");
const winston = require("winston");
const path = require("path");
const fs = require("fs").promises;
const config = require("./config.json");
const os = require("os");
require("dotenv").config();

// ロガーの設定
const logger = winston.createLogger({
	level: config.logging.level || "info",
	format: winston.format.combine(
		winston.format.timestamp(),
		winston.format.errors({ stack: true }),
		winston.format.json()
	),
	transports: [
		new winston.transports.File({
			filename: config.logging.file || "./file-watcher.log",
		}),
		new winston.transports.Console({
			format: winston.format.combine(
				winston.format.colorize(),
				winston.format.simple()
			),
		}),
	],
});

// Supabaseクライアントの初期化
const supabaseUrl = config.supabase.url || process.env.SUPABASE_URL;
const supabaseKey =
	config.supabase.serviceRoleKey || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
	logger.error(
		"Supabase設定が不完全です。環境変数またはconfig.jsonを確認してください。"
	);
	logger.error("必要な環境変数: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY");
	process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ファイル処理クラス
class PhotoProcessor {
	constructor() {
		this.processingFiles = new Set();
	}

	// ファイルサイズをチェック
	async checkFileSize(filePath) {
		try {
			const stats = await fs.stat(filePath);
			const maxSize = config.upload.maxFileSize || 10 * 1024 * 1024; // 10MB
			return stats.size <= maxSize;
		} catch (error) {
			logger.error(`ファイルサイズチェックエラー: ${filePath}`, error);
			return false;
		}
	}

	// ファイル拡張子をチェック
	isAllowedExtension(filePath) {
		const ext = path.extname(filePath).toLowerCase().slice(1);
		const allowedExtensions = config.upload.allowedExtensions || [
			"jpg",
			"jpeg",
			"png",
			"heic",
		];
		return allowedExtensions.includes(ext);
	}

	// 圧縮ファイルかどうかをチェック
	isCompressedFile(filePath) {
		return filePath.includes("_compressed");
	}

	// 画像を圧縮
	async compressImage(inputPath, outputPath) {
		try {
			const quality = config.upload.compressQuality || 80;
			await sharp(inputPath).jpeg({ quality }).toFile(outputPath);
			return outputPath;
		} catch (error) {
			logger.error(`画像圧縮エラー: ${inputPath}`, error);
			return inputPath; // 圧縮に失敗した場合は元のファイルを使用
		}
	}

	// ファイル名を安全な形式に変換
	sanitizeFileName(fileName) {
		// 日本語とスペースを除去し、英数字とハイフン、アンダースコアのみに
		return fileName
			.replace(/[^\w\-_.]/g, "_")
			.replace(/_+/g, "_")
			.replace(/^_|_$/g, "");
	}

	// 退避フォルダを作成
	async ensureBackupFolder() {
		const backupFolder = config.upload.backupFolder;
		if (!backupFolder) return;

		try {
			await fs.access(backupFolder);
			logger.debug(`退避フォルダが存在します: ${backupFolder}`);
		} catch (error) {
			// フォルダが存在しない場合は作成
			await fs.mkdir(backupFolder, { recursive: true });
			logger.info(`退避フォルダを作成しました: ${backupFolder}`);
		}
	}

	// ファイルを退避フォルダに移動
	async moveToBackupFolder(filePath) {
		if (!config.upload.moveToBackupFolder || !config.upload.backupFolder) {
			return;
		}

		try {
			await this.ensureBackupFolder();

			const fileName = path.basename(filePath);
			const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
			const backupFileName = `${timestamp}_${fileName}`;
			const backupPath = path.join(config.upload.backupFolder, backupFileName);

			await fs.rename(filePath, backupPath);
			logger.info(`ファイルを退避: ${fileName} -> ${backupPath}`);
		} catch (error) {
			logger.error(`ファイル退避エラー: ${filePath}`, error);
		}
	}

	// ファイルをSupabaseにアップロード
	async uploadToSupabase(filePath, sessionId = null) {
		try {
			const originalFileName = path.basename(filePath);
			const safeFileName = this.sanitizeFileName(originalFileName);
			const uploadPath = sessionId
				? `${sessionId}/${safeFileName}`
				: safeFileName;

			// ファイルを読み込み
			const fileBuffer = await fs.readFile(filePath);

			// Supabaseにアップロード
			const { data, error } = await supabase.storage
				.from(config.supabase.bucketName)
				.upload(uploadPath, fileBuffer, {
					contentType: "image/jpeg",
					upsert: true,
				});

			if (error) {
				throw error;
			}

			logger.info(`アップロード成功: ${originalFileName} -> ${uploadPath}`);
			return data;
		} catch (error) {
			logger.error(`アップロードエラー: ${filePath}`, error);
			throw error;
		}
	}

	// ファイルを処理
	async processFile(filePath) {
		if (this.processingFiles.has(filePath)) {
			logger.info(`ファイル処理中: ${filePath}`);
			return;
		}

		// 圧縮ファイルは処理しない（無限ループを防ぐ）
		if (this.isCompressedFile(filePath)) {
			logger.info(`圧縮ファイルをスキップ: ${filePath}`);
			return;
		}

		this.processingFiles.add(filePath);

		try {
			logger.info(`ファイル検出: ${filePath}`);

			// ファイルサイズチェック
			if (!(await this.checkFileSize(filePath))) {
				logger.warn(`ファイルサイズ超過: ${filePath}`);
				return;
			}

			// 拡張子チェック
			if (!this.isAllowedExtension(filePath)) {
				logger.warn(`サポートされていない拡張子: ${filePath}`);
				return;
			}

			// ファイルが完全に書き込まれるまで少し待機
			await new Promise((resolve) => setTimeout(resolve, 1000));

			// 画像圧縮（設定が有効な場合）
			let processedFilePath = filePath;
			if (config.upload.compressImages) {
				const compressedPath = filePath.replace(/\.[^/.]+$/, "_compressed.jpg");
				processedFilePath = await this.compressImage(filePath, compressedPath);
			}

			// セッションIDを抽出（ファイル名から）
			const fileName = path.basename(filePath);
			const sessionMatch = fileName.match(/^(.+?)_/);
			const sessionId = sessionMatch ? sessionMatch[1] : null;

			// Supabaseにアップロード
			await this.uploadToSupabase(processedFilePath, sessionId);

			// 圧縮ファイルを削除（元のファイルとは異なる場合）
			if (processedFilePath !== filePath) {
				await fs.unlink(processedFilePath);
			}

			// アップロード完了後、元ファイルを退避フォルダに移動
			await this.moveToBackupFolder(filePath);

			logger.info(`ファイル処理完了: ${filePath}`);
		} catch (error) {
			logger.error(`ファイル処理エラー: ${filePath}`, error);
		} finally {
			this.processingFiles.delete(filePath);
		}
	}
}

// フォルダを作成する関数
async function ensureFolder(folderPath, folderName) {
	try {
		await fs.access(folderPath);
		logger.info(`${folderName}フォルダが存在します: ${folderPath}`);
	} catch (error) {
		// フォルダが存在しない場合は作成
		await fs.mkdir(folderPath, { recursive: true });
		logger.info(`${folderName}フォルダを作成しました: ${folderPath}`);
	}
}

// パスの~や絶対パスをホームディレクトリに展開する関数
function expandHomeDir(p) {
	if (!p) return p;
	if (p.startsWith("~/")) {
		return path.join(os.homedir(), p.slice(2));
	}
	return p;
}

// configのパスを展開
if (config.watch && config.watch.folder) {
	config.watch.folder = expandHomeDir(config.watch.folder);
}
if (config.upload && config.upload.backupFolder) {
	config.upload.backupFolder = expandHomeDir(config.upload.backupFolder);
}

// メイン処理
async function main() {
	const processor = new PhotoProcessor();
	const watchFolder = config.watch.folder;

	if (!watchFolder) {
		logger.error(
			"監視フォルダが設定されていません。config.jsonを確認してください。"
		);
		process.exit(1);
	}

	// 監視フォルダを作成（設定が有効な場合）
	if (config.watch.createFolderIfNotExists !== false) {
		await ensureFolder(watchFolder, "監視");
	}

	// 退避フォルダも作成（設定されている場合）
	if (
		config.upload.backupFolder &&
		config.upload.createBackupFolderIfNotExists !== false
	) {
		await ensureFolder(config.upload.backupFolder, "退避");
	}

	logger.info(`監視開始: ${watchFolder}`);

	// ファイル監視の設定
	const watcher = chokidar.watch(watchFolder, {
		ignored: [
			/(^|[\/\\])\../, // 隠しファイルを無視
			/.*_compressed\.(jpg|jpeg|png)$/i, // 圧縮ファイルを無視
		],
		persistent: true,
		awaitWriteFinish: {
			stabilityThreshold: config.watch.stabilityThreshold || 2000,
			pollInterval: config.watch.pollInterval || 100,
		},
	});

	// イベントリスナー
	watcher
		.on("add", async (filePath) => {
			await processor.processFile(filePath);
		})
		.on("change", async (filePath) => {
			await processor.processFile(filePath);
		})
		.on("error", (error) => {
			logger.error("監視エラー:", error);
		})
		.on("ready", () => {
			logger.info("ファイル監視の準備完了");
		});

	// プロセス終了時の処理
	process.on("SIGINT", () => {
		logger.info("監視を停止中...");
		watcher.close();
		process.exit(0);
	});

	process.on("SIGTERM", () => {
		logger.info("監視を停止中...");
		watcher.close();
		process.exit(0);
	});
}

// エラーハンドリング
process.on("uncaughtException", (error) => {
	logger.error("未処理の例外:", error);
	process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
	logger.error("未処理のPromise拒否:", reason);
	process.exit(1);
});

// アプリケーション開始
main().catch((error) => {
	logger.error("アプリケーション起動エラー:", error);
	process.exit(1);
});
