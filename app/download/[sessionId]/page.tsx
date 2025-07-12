import { supabase } from "@/lib/supabaseClient";
import React from "react";

const BUCKET_NAME =
	process.env.NEXT_PUBLIC_SUPABASE_BUCKET_NAME || "private-photos";
const TABLE_NAME =
	process.env.NEXT_PUBLIC_PHOTO_SESSION_TABLE || "PhotoSession";

export default async function DownloadPage({
	params,
}: {
	params: { sessionId: string };
}) {
	const { sessionId } = params;

	// DBからファイル名リストを取得
	const { data: session, error } = await supabase
		.from(TABLE_NAME)
		.select("photoFileNames")
		.eq("sessionId", sessionId)
		.single();

	// エラーハンドリングを改善
	if (error) {
		console.error("[DownloadPage] Supabase error:", error);
		return (
			<div className="flex flex-col items-center justify-center min-h-screen p-4">
				<div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 max-w-md">
					<h1 className="text-xl font-bold text-red-700 mb-2">
						エラーが発生しました
					</h1>
					<p className="text-red-600 mb-4">写真情報の取得に失敗しました。</p>
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

	if (!session) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen p-4">
				<div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 max-w-md">
					<h1 className="text-xl font-bold text-yellow-700 mb-2">
						写真が見つかりません
					</h1>
					<p className="text-yellow-600">
						指定されたセッションIDの写真が見つかりませんでした。
					</p>
					<p className="text-sm text-yellow-500 mt-2">
						セッションID: {sessionId}
					</p>
				</div>
			</div>
		);
	}

	// 各ファイルの署名付きURLを取得
	const signedUrls = await Promise.all(
		session.photoFileNames.map(async (fileName: string) => {
			const { data } = await supabase.storage
				.from(BUCKET_NAME)
				.createSignedUrl(`${sessionId}/${fileName}`, 60 * 60 * 24 * 7);
			return { fileName, url: data?.signedUrl || "" };
		})
	);

	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
			<div className="container mx-auto px-4 py-8">
				<div className="text-center mb-8">
					<h1 className="text-4xl font-bold text-gray-800 mb-2">
						写真ダウンロード
					</h1>
					<p className="text-gray-600">撮影した写真をダウンロードできます</p>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
					{signedUrls.map(({ fileName, url }, idx) => (
						<div
							key={`${fileName}_${idx}`}
							className="bg-white rounded-2xl shadow-lg border-2 border-purple-200 overflow-hidden hover:shadow-xl transition-shadow"
						>
							<div className="p-4">
								<img
									src={url}
									alt={fileName}
									className="w-full h-48 object-cover rounded-xl mb-4"
								/>
								<div className="text-center">
									<p className="text-sm text-gray-600 mb-3">{fileName}</p>
									<a
										href={url}
										download={fileName}
										className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity"
									>
										ダウンロード
									</a>
								</div>
							</div>
						</div>
					))}
				</div>

				<div className="text-center">
					<div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 inline-block">
						<p className="text-blue-700 font-medium">
							※ダウンロード期限は1週間です
						</p>
						<p className="text-blue-600 text-sm mt-1">
							セッションID: {sessionId}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
