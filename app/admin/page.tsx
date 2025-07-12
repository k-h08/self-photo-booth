"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
	ArrowLeft,
	Save,
	Camera,
	Mail,
	Download,
	Settings,
	Home,
} from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

export default function AdminPage() {
	const router = useRouter();
	// 撮影設定
	const [captureMode, setCaptureMode] = useState("time"); // timeで固定
	const [photoCount, setPhotoCount] = useState("4");
	const [timeLimit, setTimeLimit] = useState("3");
	const [mirror, setMirror] = useState(true);

	// 受け取り設定
	const [allowUserChoice, setAllowUserChoice] = useState(true);
	const [deliveryMethod, setDeliveryMethod] = useState("qr");

	// 認証関連
	const [authOpen, setAuthOpen] = useState(true);
	const [password, setPassword] = useState("");
	const [authError, setAuthError] = useState("");

	// 初期表示時に設定を取得して反映
	useEffect(() => {
		const fetchSettings = async () => {
			const res = await fetch("/api/settings");
			if (res.ok) {
				const data = await res.json();
				if (data) {
					setCaptureMode("time"); // 強制的にtime
					setPhotoCount(data.photoCount?.toString() || "4");
					setTimeLimit(data.timeLimit?.toString() || "3");
					setAllowUserChoice(
						typeof data.allowUserChoice === "boolean"
							? data.allowUserChoice
							: true
					);
					setDeliveryMethod(data.deliveryMethod || "qr");
					setMirror(typeof data.mirror === "boolean" ? data.mirror : true);
				}
			}
		};
		fetchSettings();
	}, []);

	const handleSaveSettings = async () => {
		const settings = {
			captureMode,
			photoCount: Number.parseInt(photoCount),
			timeLimit: Number.parseInt(timeLimit),
			allowUserChoice,
			deliveryMethod,
			mirror,
		};

		try {
			const res = await fetch("/api/settings", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(settings),
			});
			if (res.ok) {
				alert("設定を保存しました");
			} else {
				alert("保存に失敗しました");
			}
		} catch (e) {
			alert("保存時にエラーが発生しました");
		}
	};

	const handleAuth = async () => {
		setAuthError("");
		const res = await fetch("/api/admin-auth", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ password }),
		});
		if (res.ok) {
			setAuthOpen(false);
			setPassword("");
		} else {
			setAuthError("パスワードが違います");
		}
	};

	const handleDialogOpenChange = (open: boolean) => {
		setAuthOpen(open);
		if (!open) {
			router.push("/");
		}
	};

	return (
		<>
			<Link href="/" className="fixed top-6 right-6 z-50">
				<Button
					variant="ghost"
					size="icon"
					className="rounded-full p-3 bg-white/80 hover:bg-white shadow-lg border-2 border-purple-300"
				>
					<Home className="h-8 w-8 text-purple-500" />
				</Button>
			</Link>
			<Dialog open={authOpen} onOpenChange={handleDialogOpenChange}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>管理画面パスワード</DialogTitle>
					</DialogHeader>
					<Input
						type="password"
						placeholder="パスワードを入力"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") handleAuth();
						}}
						className="mb-2"
					/>
					<button
						className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-2 rounded-xl mt-2"
						onClick={handleAuth}
					>
						認証
					</button>
					{authError && (
						<div className="text-red-500 text-sm mt-2">{authError}</div>
					)}
				</DialogContent>
			</Dialog>
			{!authOpen && (
				<div className="min-h-screen confetti-bg">
					<div className="container py-10 px-4 sm:px-6">
						<div className="max-w-3xl mx-auto space-y-8">
							<Card className="shadow-xl bg-white/90 backdrop-blur-sm border-4 border-purple-300">
								<CardHeader className="p-8 flex flex-row items-center justify-between">
									<div className="flex items-center gap-4 w-full">
										<Link href="/">
											<Button
												variant="ghost"
												size="lg"
												className="text-lg p-4 h-auto rounded-full"
											>
												<ArrowLeft className="h-6 w-6 text-purple-500" />
												<span className="sr-only">戻る</span>
											</Button>
										</Link>
										<div>
											<CardTitle className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 via-pink-600 to-red-500 drop-shadow-lg">
												管理画面
											</CardTitle>
											<CardDescription className="text-lg">
												撮影設定と受け取り方法を管理します
											</CardDescription>
										</div>
									</div>
								</CardHeader>
							</Card>

							<Tabs defaultValue="capture" className="space-y-6">
								<TabsList className="grid w-full grid-cols-2 h-auto p-1 bg-purple-100 rounded-xl">
									<TabsTrigger
										value="capture"
										className="text-lg py-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-lg"
									>
										<Camera className="mr-2 h-5 w-5" />
										撮影設定
									</TabsTrigger>
									<TabsTrigger
										value="delivery"
										className="text-lg py-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white rounded-lg"
									>
										<Mail className="mr-2 h-5 w-5" />
										受け取り設定
									</TabsTrigger>
								</TabsList>

								<TabsContent value="capture">
									<Card className="shadow-xl bg-white/90 backdrop-blur-sm border-4 border-purple-300">
										<CardHeader className="p-8">
											<CardTitle className="text-2xl font-bold flex items-center">
												<Camera className="mr-2 h-6 w-6 text-purple-500" />
												撮影設定
											</CardTitle>
											<CardDescription className="text-lg">
												撮影の枚数や時間制限を設定します
											</CardDescription>
										</CardHeader>
										<CardContent className="space-y-8 p-8">
											{/* 撮影モード選択UIを非表示に */}
											{/*
											<div className="space-y-4">
												<Label className="text-lg font-medium">
													撮影モード
												</Label>
												<RadioGroup
													value={captureMode}
													onValueChange={setCaptureMode}
													className="space-y-4"
												>
													<div className="flex items-center space-x-3 border-2 border-purple-200 p-5 rounded-xl hover:bg-purple-50 transition-colors">
														<div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center">
															<Settings className="w-5 h-5 text-white" />
														</div>
														<RadioGroupItem
															value="count"
															id="count"
															className="w-6 h-6"
														/>
														<Label
															htmlFor="count"
															className="flex-1 cursor-pointer text-lg"
														>
															枚数制限
														</Label>
													</div>
													<div className="flex items-center space-x-3 border-2 border-purple-200 p-5 rounded-xl hover:bg-purple-50 transition-colors">
														<div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center">
															<Settings className="w-5 h-5 text-white" />
														</div>
														<RadioGroupItem
															value="time"
															id="time"
															className="w-6 h-6"
														/>
														<Label
															htmlFor="time"
															className="flex-1 cursor-pointer text-lg"
														>
															時間制限
														</Label>
													</div>
												</RadioGroup>
											</div>
											*/}

											{/* 枚数制限UIも非表示に */}
											{/*
											{captureMode === "count" ? (
												<div className="space-y-3">
													<Label
														htmlFor="photoCount"
														className="text-lg font-medium"
													>
														撮影枚数
													</Label>
													<Input
														id="photoCount"
														type="number"
														min="1"
														max="20"
														value={photoCount}
														onChange={(e) => setPhotoCount(e.target.value)}
														className="text-lg p-6 h-auto rounded-xl border-2 border-purple-200"
													/>
													<p className="text-base text-gray-500">
														1〜20枚まで設定できます
													</p>
												</div>
											) : (
												<div className="space-y-3">
													<Label
														htmlFor="timeLimit"
														className="text-lg font-medium"
													>
														制限時間（分）
													</Label>
													<Input
														id="timeLimit"
														type="number"
														min="1"
														max="10"
														value={timeLimit}
														onChange={(e) => setTimeLimit(e.target.value)}
														className="text-lg p-6 h-auto rounded-xl border-2 border-purple-200"
													/>
													<p className="text-base text-gray-500">
														1〜10分まで設定できます
													</p>
												</div>
											)}
											*/}
										</CardContent>
									</Card>
								</TabsContent>

								<TabsContent value="delivery">
									<Card className="shadow-xl bg-white/90 backdrop-blur-sm border-4 border-purple-300">
										<CardHeader className="p-8">
											<CardTitle className="text-2xl font-bold flex items-center">
												<Mail className="mr-2 h-6 w-6 text-purple-500" />
												受け取り設定
											</CardTitle>
											<CardDescription className="text-lg">
												写真の受け取り方法を設定します
											</CardDescription>
										</CardHeader>
										<CardContent className="space-y-8 p-8">
											<div className="flex items-center justify-between p-6 border-2 border-purple-200 rounded-xl bg-purple-50">
												<Label
													htmlFor="user-choice"
													className="text-lg font-medium"
												>
													ユーザーに選択させる
												</Label>
												<Switch
													id="user-choice"
													checked={allowUserChoice}
													onCheckedChange={setAllowUserChoice}
													className="scale-125 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-500 data-[state=checked]:to-pink-500"
												/>
											</div>

											{!allowUserChoice && (
												<div className="space-y-4">
													<Label className="text-lg font-medium">
														受け取り方法
													</Label>
													<RadioGroup
														value={deliveryMethod}
														onValueChange={setDeliveryMethod}
														className="space-y-4"
													>
														<div className="flex items-center space-x-3 border-2 border-purple-200 p-5 rounded-xl hover:bg-purple-50 transition-colors">
															<div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center">
																<Download className="w-5 h-5 text-white" />
															</div>
															<RadioGroupItem
																value="qr"
																id="admin-qr"
																className="w-6 h-6"
															/>
															<Label
																htmlFor="admin-qr"
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
																id="admin-email"
																className="w-6 h-6"
															/>
															<Label
																htmlFor="admin-email"
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
																id="admin-direct"
																className="w-6 h-6"
															/>
															<Label
																htmlFor="admin-direct"
																className="flex-1 cursor-pointer text-lg"
															>
																ファイルに直接保存
															</Label>
														</div>
													</RadioGroup>
												</div>
											)}
										</CardContent>
									</Card>
								</TabsContent>
							</Tabs>

							<Button
								className="w-full text-xl p-8 h-auto rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-90 shadow-xl border-2 border-white"
								size="lg"
								onClick={handleSaveSettings}
							>
								<Save className="mr-2 h-6 w-6" />
								設定を保存
							</Button>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
