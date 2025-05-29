"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
	ArrowRight,
	Camera,
	Mail,
	Download,
	Sparkles,
	Home,
} from "lucide-react";
import Link from "next/link";

export default function StartPage() {
	const router = useRouter();
	const [step, setStep] = useState(1);
	const [fileName, setFileName] = useState("");
	const [deliveryMethod, setDeliveryMethod] = useState("qr");
	const [photoCount, setPhotoCount] = useState(4);
	const [timeLimit, setTimeLimit] = useState<number | null>(null);
	const [captureMode, setCaptureMode] = useState<"count" | "time">("count");
	const [allowUserChoice, setAllowUserChoice] = useState(true);

	useEffect(() => {
		const fetchSettings = async () => {
			const res = await fetch("/api/settings", { cache: "no-store" });
			if (res.ok) {
				const data = await res.json();
				if (data) {
					setCaptureMode(data.captureMode || "count");
					if (data.captureMode === "count") {
						setPhotoCount(data.photoCount || 4);
						setTimeLimit(null);
					} else {
						setTimeLimit(data.timeLimit ?? null);
						setPhotoCount(4); // デフォルト値
					}
					setAllowUserChoice(
						typeof data.allowUserChoice === "boolean"
							? data.allowUserChoice
							: true
					);
					setDeliveryMethod(data.deliveryMethod || "qr");
				}
			}
		};
		fetchSettings();
	}, []);

	const photoSettings = {
		photoCount,
		timeLimit,
	};

	const handleNext = () => {
		if (step < 3) {
			setStep(step + 1);
		} else {
			router.push("/camera");
		}
	};

	// 各ステップのアイコンとカラー
	const stepInfo = [
		{
			icon: <Sparkles className="h-8 w-8" />,
			color: "from-blue-500 to-purple-500",
			title: "撮影の準備",
		},
		{
			icon: <Mail className="h-8 w-8" />,
			color: "from-purple-500 to-pink-500",
			title: "受け取り方法",
		},
		{
			icon: <Camera className="h-8 w-8" />,
			color: "from-pink-500 to-orange-500",
			title: "設定確認",
		},
	];

	return (
		<div className="min-h-screen confetti-bg">
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
				<Card className="w-full max-w-xl mx-auto shadow-xl bg-white/90 backdrop-blur-sm border-4 border-purple-300">
					<CardHeader className="text-center p-8">
						<div className="flex justify-center mb-6">
							{stepInfo.map((info, idx) => (
								<div key={idx} className="flex flex-col items-center mx-4">
									<div
										className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 ${
											step === idx + 1
												? `bg-gradient-to-r ${info.color} text-white pulse`
												: idx + 1 < step
												? "bg-green-100 text-green-500"
												: "bg-gray-100 text-gray-400"
										}`}
									>
										{info.icon}
									</div>
									<span
										className={`text-sm ${step === idx + 1 ? "font-bold" : ""}`}
									>
										{idx + 1}
									</span>
								</div>
							))}
						</div>

						<CardTitle className="text-4xl sm:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 via-pink-600 to-red-500 drop-shadow-lg">
							{stepInfo[step - 1].title}
						</CardTitle>
						<CardDescription className="text-lg mt-2">
							{step === 1 && "撮影の準備をしましょう！"}
							{step === 2 && "写真の受け取り方法を選択してください"}
							{step === 3 && "撮影の設定を確認してください"}
						</CardDescription>
					</CardHeader>

					<CardContent className="p-8">
						{step === 1 && (
							<div className="space-y-6">
								<div className="space-y-3">
									<Label htmlFor="fileName" className="text-lg font-medium">
										ファイル名（任意）
									</Label>
									<Input
										id="fileName"
										placeholder="例: 文化祭2024"
										value={fileName}
										onChange={(e) => setFileName(e.target.value)}
										className="text-lg p-6 h-auto rounded-xl border-2 border-purple-200 focus:border-purple-400"
									/>
								</div>
							</div>
						)}

						{step === 2 && (
							<div className="space-y-6">
								<Label className="text-lg font-medium">受け取り方法</Label>
								{allowUserChoice ? (
									<RadioGroup
										value={deliveryMethod}
										onValueChange={setDeliveryMethod}
										className="space-y-4"
									>
										<div className="flex items-center space-x-3 border-2 border-purple-200 p-5 rounded-xl hover:bg-purple-50 transition-colors">
											<div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center">
												<Download className="w-5 h-5 text-white" />
											</div>
											<RadioGroupItem value="qr" id="qr" className="w-6 h-6" />
											<Label
												htmlFor="qr"
												className="flex-1 cursor-pointer text-lg"
											>
												QRコードでダウンロード
											</Label>
										</div>
										<div className="flex items-center space-x-3 border-2 border-purple-200 p-5 rounded-xl hover:bg-purple-50 transition-colors">
											<div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center">
												<Mail className="w-5 h-5 text-white" />
											</div>
											<RadioGroupItem
												value="email"
												id="email"
												className="w-6 h-6"
											/>
											<Label
												htmlFor="email"
												className="flex-1 cursor-pointer text-lg"
											>
												メールで受け取る
											</Label>
										</div>
										<div className="flex items-center space-x-3 border-2 border-purple-200 p-5 rounded-xl hover:bg-purple-50 transition-colors">
											<div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-400 to-orange-400 flex items-center justify-center">
												<Download className="w-5 h-5 text-white" />
											</div>
											<RadioGroupItem
												value="direct"
												id="direct"
												className="w-6 h-6"
											/>
											<Label
												htmlFor="direct"
												className="flex-1 cursor-pointer text-lg"
											>
												ファイルに直接保存
											</Label>
										</div>
									</RadioGroup>
								) : (
									<div className="flex items-center space-x-3 border-2 border-purple-200 p-5 rounded-xl bg-purple-50">
										{deliveryMethod === "qr" && (
											<>
												<div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center">
													<Download className="w-5 h-5 text-white" />
												</div>
												<span className="text-lg">QRコードでダウンロード</span>
											</>
										)}
										{deliveryMethod === "email" && (
											<>
												<div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center">
													<Mail className="w-5 h-5 text-white" />
												</div>
												<span className="text-lg">メールで受け取る</span>
											</>
										)}
										{deliveryMethod === "direct" && (
											<>
												<div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-400 to-orange-400 flex items-center justify-center">
													<Download className="w-5 h-5 text-white" />
												</div>
												<span className="text-lg">ファイルに直接保存</span>
											</>
										)}
									</div>
								)}
							</div>
						)}

						{step === 3 && (
							<div className="space-y-8 py-4">
								<div className="text-center space-y-3">
									<h3 className="text-2xl font-medium">撮影設定</h3>
									{timeLimit ? (
										<p className="text-5xl font-bold rainbow-text">
											{timeLimit}分間
										</p>
									) : (
										<p className="text-5xl font-bold rainbow-text">
											{photoCount}枚
										</p>
									)}
									<p className="text-lg text-gray-600">
										{timeLimit
											? `${timeLimit}分間の間に好きなだけ撮影できます`
											: `${photoCount}枚の写真を撮影します`}
									</p>
								</div>

								<div className="p-5 border-2 border-purple-200 rounded-xl bg-purple-50">
									<h3 className="text-xl font-medium mb-2">受け取り方法</h3>
									<p className="text-lg flex items-center">
										{deliveryMethod === "qr" && (
											<>
												<Download className="mr-2 h-5 w-5 text-purple-500" />
												QRコードでダウンロード
											</>
										)}
										{deliveryMethod === "email" && (
											<>
												<Mail className="mr-2 h-5 w-5 text-purple-500" />
												メールで受け取る
											</>
										)}
										{deliveryMethod === "direct" && (
											<>
												<Download className="mr-2 h-5 w-5 text-purple-500" />
												ファイルに直接保存
											</>
										)}
									</p>
								</div>

								{fileName && (
									<div className="p-5 border-2 border-purple-200 rounded-xl bg-purple-50">
										<h3 className="text-xl font-medium mb-2">ファイル名</h3>
										<p className="text-lg">{fileName}</p>
									</div>
								)}
							</div>
						)}
					</CardContent>

					<CardFooter className="p-8">
						<Button
							className="w-full text-xl p-6 h-auto rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-90 shadow-lg"
							size="lg"
							onClick={handleNext}
						>
							{step < 3 ? "次へ" : "撮影開始"}{" "}
							<ArrowRight className="ml-2 h-6 w-6 bounce" />
						</Button>
					</CardFooter>
				</Card>
			</div>
		</div>
	);
}
