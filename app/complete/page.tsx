"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	CheckCircle,
	Download,
	Home,
	Mail,
	PartyPopper,
	Share2,
	Sparkles,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { QRCode } from "@/components/QRCode";

function CompleteContent() {
	const searchParams = useSearchParams();
	const sessionId = searchParams.get("session");
	const deliveryMethod = searchParams.get("delivery") || "qr";

	const [email, setEmail] = useState("");
	const [emailSent, setEmailSent] = useState(false);

	// QRコード用の絶対URLを生成
	const [downloadUrl, setDownloadUrl] = useState("");
	useEffect(() => {
		if (sessionId) {
			const origin =
				typeof window !== "undefined" ? window.location.origin : "";
			setDownloadUrl(`${origin}/download/${sessionId}`);
		}
	}, [sessionId]);

	// 紙吹雪のランダム生成（クライアント側のみ）
	const [confetti, setConfetti] = useState<any[]>([]);
	useEffect(() => {
		setConfetti(
			Array.from({ length: 20 }).map(() => ({
				top: `${Math.random() * 100}%`,
				left: `${Math.random() * 100}%`,
				width: `${Math.random() * 10 + 5}px`,
				height: `${Math.random() * 10 + 5}px`,
				backgroundColor: [
					"#FF61D2",
					"#FE9090",
					"#FFC561",
					"#FFF480",
					"#BFFF00",
					"#4DEEEA",
					"#7A7AFF",
				][Math.floor(Math.random() * 7)],
				borderRadius: Math.random() > 0.5 ? "50%" : "0",
				transform: `rotate(${Math.random() * 360}deg)`,
				opacity: 0.7,
			}))
		);
	}, []);

	const handleSendEmail = () => {
		// 実際にはここでメール送信APIを呼び出す
		console.log("メール送信:", email);
		setEmailSent(true);
	};

	return (
		<>
			{/* 右上にトップに戻るボタン */}
			<Link href="/" className="fixed top-6 right-6 z-50">
				<Button
					variant="ghost"
					size="icon"
					className="rounded-full p-3 bg-white/80 hover:bg-white shadow-lg border-2 border-purple-300"
				>
					<Home className="h-8 w-8 text-purple-500" />
				</Button>
			</Link>
			<div className="container flex items-center justify-center min-h-screen p-4 sm:p-6">
				<Card className="w-full max-w-xl mx-auto shadow-2xl bg-white/90 backdrop-blur-sm border-4 border-purple-300">
					<div className="absolute -top-16 -left-16 w-32 h-32 bg-yellow-300 rounded-full opacity-30 animate-pulse"></div>
					<div className="absolute -bottom-16 -right-16 w-32 h-32 bg-blue-300 rounded-full opacity-30 animate-pulse"></div>

					<CardHeader className="text-center p-8 relative">
						<div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
							<div className="w-20 h-20 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center border-4 border-white">
								<PartyPopper className="h-10 w-10 text-white" />
							</div>
						</div>

						<div className="mt-6">
							<CardTitle className="text-5xl sm:text-6xl font-extrabold rainbow-text drop-shadow-lg">
								撮影完了！
							</CardTitle>
							<CardDescription className="text-lg mt-2 font-medium">
								写真の受け取り方法を選択してください
							</CardDescription>
						</div>

						{/* 紙吹雪のような装飾 */}
						{confetti.map((c, i) => (
							<div key={i} className="absolute" style={c}></div>
						))}
					</CardHeader>

					<CardContent className="space-y-8 p-8 relative">
						{deliveryMethod === "qr" && (
							<div className="text-center">
								<div className="bg-gradient-to-r from-indigo-100 to-purple-100 p-6 rounded-2xl inline-block border-4 border-white shadow-lg pulse">
									<div className="flex justify-center my-2">
										{sessionId ? (
											<QRCode value={downloadUrl} size={220} />
										) : (
											<span className="text-gray-400">QRコードを生成中...</span>
										)}
									</div>
								</div>
								<p className="mt-3 text-lg text-gray-600">
									QRコードをスキャンして写真をダウンロード
								</p>
								{downloadUrl && (
									<p className="mt-2 text-xs text-gray-400 break-all">
										{downloadUrl}
									</p>
								)}
							</div>
						)}
						{deliveryMethod === "email" && (
							<div className="border-2 border-purple-200 rounded-xl p-6 bg-purple-50">
								<h3 className="text-xl font-bold mb-3 flex items-center">
									<Mail className="mr-2 h-6 w-6 text-purple-500" />
									メールで受け取る
								</h3>
								<div className="flex flex-col sm:flex-row gap-3">
									<Input
										type="email"
										placeholder="メールアドレスを入力"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										disabled={emailSent}
										className="text-lg p-6 h-auto flex-1 rounded-xl border-2 border-purple-200"
									/>
									<Button
										variant={emailSent ? "outline" : "default"}
										onClick={handleSendEmail}
										disabled={!email || emailSent}
										className={`text-lg p-6 h-auto rounded-xl ${
											emailSent
												? "bg-green-100 text-green-700 border-2 border-green-300"
												: "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
										}`}
									>
										{emailSent ? (
											<>
												<CheckCircle className="mr-2 h-6 w-6" />
												送信済み
											</>
										) : (
											<>
												<Mail className="mr-2 h-6 w-6" />
												送信
											</>
										)}
									</Button>
								</div>
							</div>
						)}
						{deliveryMethod === "direct" && (
							<div className="border-2 border-purple-200 rounded-xl p-6 bg-purple-50">
								<h3 className="text-xl font-bold mb-3 flex items-center">
									<Download className="mr-2 h-6 w-6 text-purple-500" />
									直接ダウンロード
								</h3>
								<Button
									variant="outline"
									className="w-full text-lg p-6 h-auto rounded-xl border-2 border-purple-200 hover:bg-purple-100"
								>
									<Download className="mr-2 h-6 w-6 text-purple-500" />
									写真をダウンロード
								</Button>
							</div>
						)}

						<div className="flex justify-center space-x-4">
							<Button
								variant="outline"
								className="rounded-full p-4 aspect-square h-auto border-2 border-purple-200 hover:bg-purple-100"
							>
								<Share2 className="h-6 w-6 text-purple-500" />
								<span className="sr-only">シェア</span>
							</Button>
						</div>
					</CardContent>

					<CardFooter className="p-8">
						<Link href="/" className="w-full">
							<Button
								variant="ghost"
								className="w-full text-lg p-6 h-auto rounded-full border-2 border-purple-200 hover:bg-purple-50"
							>
								<Home className="mr-2 h-6 w-6 text-purple-500" />
								トップに戻る
							</Button>
						</Link>
					</CardFooter>
				</Card>
			</div>
		</>
	);
}

export default function CompletePage() {
	return (
		<div className="min-h-screen gradient-bg">
			<Suspense>
				<CompleteContent />
			</Suspense>

			{/* 装飾要素 */}
			<div className="fixed top-10 right-10 animate-bounce">
				<Sparkles className="h-10 w-10 text-yellow-300" />
			</div>
			<div
				className="fixed bottom-10 left-10 animate-bounce"
				style={{ animationDelay: "0.5s" }}
			>
				<Sparkles className="h-10 w-10 text-pink-300" />
			</div>
		</div>
	);
}
