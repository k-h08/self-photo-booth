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

	if (error || !session) {
		console.log("[DownloadPage] error:", error);
		console.log("[DownloadPage] session:", session);
		return (
			<div>
				写真情報が見つかりません
				<pre style={{ color: "red", fontSize: 12 }}>
					{error ? JSON.stringify(error, null, 2) : null}
				</pre>
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
		<div className="flex flex-col items-center justify-center min-h-screen">
			<h1 className="text-2xl font-bold mb-4">写真ダウンロード</h1>
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
				{signedUrls.map(({ fileName, url }, idx) => (
					<div
						key={`${fileName}_${idx}`}
						className="flex flex-col items-center"
					>
						<img
							src={url}
							alt={fileName}
							className="mb-2 max-w-xs rounded-xl border-2 border-purple-200"
						/>
						<a
							href={url}
							download={fileName}
							className="bg-purple-500 text-white px-6 py-2 rounded-xl font-bold mt-2"
						>
							ダウンロード
						</a>
					</div>
				))}
			</div>
			<p className="mt-4 text-gray-500 text-sm">※ダウンロード期限は1週間です</p>
		</div>
	);
}
