import { supabase } from "@/lib/supabaseClient";
import React from "react";

const BUCKET_NAME =
	process.env.NEXT_PUBLIC_SUPABASE_BUCKET_NAME || "private-photos";
const TABLE_NAME =
	process.env.NEXT_PUBLIC_PHOTO_SESSION_TABLE || "PhotoSession";

export default async function DownloadPage({
	params,
}: {
	params: Promise<{ sessionId: string }>;
}) {
	const { sessionId } = await params;

	// DBからセッション情報（startTime, endTime含む）を取得
	const { data: session, error } = await supabase
		.from(TABLE_NAME)
		.select("startTime, endTime")
		.eq("sessionId", sessionId)
		.single();

	if (error || !session?.startTime || !session?.endTime) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen p-4">
				<div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 max-w-md">
					<h1 className="text-xl font-bold text-red-700 mb-2">
						エラーが発生しました
					</h1>
					<p className="text-red-600 mb-4">
						セッション情報の取得に失敗しました。
					</p>
					<details className="text-xs text-red-500">
						<summary>詳細情報</summary>
						<pre className="mt-2 whitespace-pre-wrap">
							{JSON.stringify(error, null, 2)}
						</pre>
					</details>
				</div>
			</div>
		);
	}

	// ストレージのルート直下の画像を取得
	const { data: files, error: storageError } = await supabase.storage
		.from(BUCKET_NAME)
		.list("", { limit: 1000 });

	if (storageError) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen p-4">
				<div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 max-w-md">
					<h1 className="text-xl font-bold text-red-700 mb-2">
						ストレージ取得エラー
					</h1>
					<p className="text-red-600 mb-4">画像リストの取得に失敗しました。</p>
					<details className="text-xs text-red-500">
						<summary>詳細情報</summary>
						<pre className="mt-2 whitespace-pre-wrap">
							{JSON.stringify(storageError, null, 2)}
						</pre>
					</details>
				</div>
			</div>
		);
	}

	// 1秒前のタイムスタンプとendTime
	const thresholdStart = Number(session.startTime) - 100;
	const thresholdEnd = Number(session.endTime);
	// 画像ファイルで、created_atがthresholdStart〜thresholdEndのものだけ
	const filteredFiles = (files || []).filter(
		(f) =>
			f.name.match(/\.(jpg|jpeg|png|heic)$/i) &&
			new Date(f.created_at).getTime() >= thresholdStart &&
			new Date(f.created_at).getTime() <= thresholdEnd
	);

	// 各ファイルの署名付きURLを取得
	const signedUrls = await Promise.all(
		filteredFiles.map(async (file) => {
			const { data } = await supabase.storage
				.from(BUCKET_NAME)
				.createSignedUrl(file.name, 60 * 60 * 24 * 7);
			return { fileName: file.name, url: data?.signedUrl || "" };
		})
	);

	return (
		<div
			className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50"
			style={{ WebkitTextSizeAdjust: "100%" }}
		>
			<div
				className="container mx-auto px-2 py-6 max-w-md"
				style={{
					paddingTop: "env(safe-area-inset-top)",
					paddingBottom: "env(safe-area-inset-bottom)",
				}}
			>
				<div className="text-center mb-6">
					<h1
						className="text-3xl font-bold text-gray-800 mb-2"
						style={{ WebkitTextSizeAdjust: "100%" }}
					>
						写真ダウンロード
					</h1>
					<p
						className="text-gray-600 text-base"
						style={{ WebkitTextSizeAdjust: "100%" }}
					>
						下の写真を長押しして「写真を保存」または「ダウンロード」を選択してください
					</p>
				</div>
				<div className="flex flex-col gap-8 mb-8">
					{signedUrls.map(({ url }, idx) => (
						<div
							key={idx}
							className="bg-white rounded-2xl shadow-lg border-2 border-purple-200 overflow-hidden hover:shadow-xl transition-shadow flex flex-col items-center p-4"
							style={{ WebkitTapHighlightColor: "transparent" }}
						>
							<img
								src={url}
								alt="撮影画像"
								className="w-full max-w-xs h-auto aspect-[9/16] object-cover rounded-xl mb-4 mx-auto"
								style={{
									touchAction: "manipulation",
									WebkitUserSelect: "none",
									WebkitTouchCallout: "none",
								}}
								draggable={false}
							/>
							<a
								href={url}
								download
								className="block w-full text-center bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xl px-0 py-4 rounded-xl font-bold hover:opacity-90 transition-opacity active:scale-95"
								style={{
									WebkitTapHighlightColor: "transparent",
									WebkitTouchCallout: "none",
									WebkitUserSelect: "none",
								}}
							>
								ダウンロード
							</a>
						</div>
					))}
				</div>
				<div
					className="text-center text-sm text-gray-500 mt-6"
					style={{ WebkitTextSizeAdjust: "100%" }}
				>
					※写真を長押しして「フォトに保存」または「画像を保存」を選ぶとスマホのカメラロールに保存できます。
				</div>
			</div>
		</div>
	);
}
