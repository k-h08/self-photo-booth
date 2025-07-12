"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, CheckCircle, Sparkles, Home } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { nanoid } from "nanoid";

const BUCKET_NAME =
	process.env.NEXT_PUBLIC_SUPABASE_BUCKET_NAME || "private-photos";

export default function CameraPage() {
	const router = useRouter();
	const videoRef = useRef<HTMLVideoElement>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [cameraReady, setCameraReady] = useState(false);
	const [photosTaken, setPhotosTaken] = useState(0);
	const [countdown, setCountdown] = useState<number | null>(null);
	const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
	const [photoCount, setPhotoCount] = useState(4);
	const [timeLimit, setTimeLimit] = useState<number | null>(null);
	const [captureMode, setCaptureMode] = useState<"count" | "time">("time"); // timeで固定
	const [deliveryMethod, setDeliveryMethod] = useState("qr");
	const [allowUserChoice, setAllowUserChoice] = useState(true);
	const [timeLeft, setTimeLeft] = useState<number | null>(null);
	const timerRef = useRef<NodeJS.Timeout | null>(null);
	const [sessionId] = useState(() => nanoid());
	const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
	const [mirror, setMirror] = useState(true);
	const [flash, setFlash] = useState(false);
	const CAMERA_ROTATE_DEGREE =
		typeof window !== "undefined"
			? Number(process.env.NEXT_PUBLIC_CAMERA_ROTATE_DEGREE) || 0
			: 0;
	const [uploadedCount, setUploadedCount] = useState(0);
	const [initialImageCount, setInitialImageCount] = useState(0);
	const [startTime] = useState(() => Date.now());

	useEffect(() => {
		const fetchSettings = async () => {
			const res = await fetch("/api/settings", { cache: "no-store" });
			if (res.ok) {
				const data = await res.json();
				if (data) {
					setCaptureMode("time"); // 強制的にtime
					setTimeLimit(data.timeLimit ?? null);
					setPhotoCount(4); // デフォルト値
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

	useEffect(() => {
		// カメラの初期化
		const initCamera = async () => {
			try {
				const stream = await navigator.mediaDevices.getUserMedia({
					video: { facingMode: "user" },
					audio: false,
				});

				if (videoRef.current) {
					videoRef.current.srcObject = stream;
					setCameraReady(true);
				}
			} catch (err) {
				console.error("カメラの初期化に失敗しました:", err);
			}
		};

		initCamera();

		// クリーンアップ
		return () => {
			if (videoRef.current && videoRef.current.srcObject) {
				const stream = videoRef.current.srcObject as MediaStream;
				stream.getTracks().forEach((track) => track.stop());
			}
		};
	}, []);

	// 撮影開始時にストレージ全体の画像数を取得
	useEffect(() => {
		const fetchInitialCount = async () => {
			const { data, error } = await supabase.storage
				.from(BUCKET_NAME)
				.list("", { limit: 1000 }); // ルート直下
			if (!error && data) {
				setInitialImageCount(
					data.filter((f) => f.name.match(/\.(jpg|jpeg|png|heic)$/i)).length
				);
			}
		};
		fetchInitialCount();
	}, []);

	// 2秒ごとにストレージ全体の画像数を取得し、差分を表示
	useEffect(() => {
		const interval = setInterval(async () => {
			const { data, error } = await supabase.storage
				.from(BUCKET_NAME)
				.list("", { limit: 1000 });
			if (!error && data) {
				const currentCount = data.filter((f) =>
					f.name.match(/\.(jpg|jpeg|png|heic)$/i)
				).length;
				setUploadedCount(Math.max(0, currentCount - initialImageCount));
			}
		}, 2000);
		return () => clearInterval(interval);
	}, [initialImageCount]);

	// 時間制限モードのタイマー処理
	useEffect(() => {
		if (captureMode === "time" && timeLimit && cameraReady) {
			setTimeLeft(timeLimit * 60); // 秒単位
			if (timerRef.current) clearInterval(timerRef.current);
			timerRef.current = setInterval(() => {
				setTimeLeft((prev) => {
					if (prev === null) return null;
					if (prev <= 1) {
						clearInterval(timerRef.current!);
						// 時間制限終了時にセッション情報を保存してから完了ページに遷移
						const saveSessionAndRedirect = async () => {
							try {
								await fetch("/api/photo-session", {
									method: "POST",
									headers: { "Content-Type": "application/json" },
									body: JSON.stringify({
										sessionId,
										files: uploadedFiles,
										startTime,
										endTime: Date.now(),
									}),
								});
								setTimeout(() => {
									router.push(`/complete?session=${sessionId}`);
								}, 500);
							} catch (error) {
								console.error("セッション保存エラー:", error);
								router.push(`/complete?delivery=${deliveryMethod}`);
							}
						};
						saveSessionAndRedirect();
						return 0;
					}
					return prev - 1;
				});
			}, 1000);
			return () => {
				if (timerRef.current) clearInterval(timerRef.current);
			};
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		captureMode,
		timeLimit,
		cameraReady,
		sessionId,
		uploadedFiles,
		deliveryMethod,
		router,
	]);

	const startCountdown = () => {
		setCountdown(3);

		const timer = setInterval(() => {
			setCountdown((prev) => {
				if (prev === null || prev <= 1) {
					clearInterval(timer);
					setFlash(true);
					setTimeout(() => {
						setFlash(false);
						capturePhoto();
					}, 120);
					return null;
				}
				return prev - 1;
			});
		}, 1000);
	};

	const uploadPhotoToSupabase = async (dataUrl: string, fileName: string) => {
		const res = await fetch(dataUrl);
		const blob = await res.blob();
		const { error } = await supabase.storage
			.from(BUCKET_NAME)
			.upload(`${sessionId}/${fileName}`, blob, {
				contentType: "image/jpeg",
				upsert: true,
			});
		if (error) throw error;
	};

	const capturePhoto = async () => {
		if (videoRef.current && canvasRef.current && cameraReady) {
			const video = videoRef.current;
			const canvas = canvasRef.current;
			const context = canvas.getContext("2d");
			if (context) {
				canvas.width = video.videoWidth;
				canvas.height = video.videoHeight;
				context.drawImage(video, 0, 0, canvas.width, canvas.height);
				const photoDataUrl = canvas.toDataURL("image/jpeg");
				const fileName = `photo_${photosTaken + 1}.jpg`;
				await uploadPhotoToSupabase(photoDataUrl, fileName);
				setUploadedFiles((prev) => [...prev, fileName]);
				setCapturedPhotos((prev) => [...prev, photoDataUrl]);
				const newPhotoCount = photosTaken + 1;
				setPhotosTaken(newPhotoCount);
				if (captureMode === "count" && newPhotoCount >= photoCount) {
					// DBにsessionIdとファイル名リストを保存するAPIを呼ぶ
					await fetch("/api/photo-session", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							sessionId,
							files: Array.from(new Set([...uploadedFiles, fileName])),
						}),
					});
					setTimeout(() => {
						router.push(`/complete?session=${sessionId}`);
					}, 1000);
				}
			}
		}
	};

	// 進捗バーの幅を計算
	const progressWidth =
		captureMode === "time" && timeLimit && timeLeft !== null
			? ((timeLimit * 60 - timeLeft) / (timeLimit * 60)) * 100
			: (photosTaken / photoCount) * 100;

	// 撮影設定
	const photoSettings = {
		photoCount,
		timeLimit,
	};

	return (
		<div className="min-h-screen gradient-bg">
			{/* 右上にトップに戻るボタン */}
			{flash && (
				<div className="fixed inset-0 bg-white opacity-90 z-[9999] transition-opacity duration-100 pointer-events-none" />
			)}
			<Link href="/" className="fixed top-6 right-6 z-50">
				<Button
					variant="ghost"
					size="icon"
					className="rounded-full p-3 bg-white/80 hover:bg-white shadow-lg border-2 border-purple-300"
				>
					<Home className="h-8 w-8 text-purple-500" />
				</Button>
			</Link>
			<div className="container flex flex-col items-center justify-center min-h-screen p-0 w-full">
				<div className="w-full max-w-6xl mx-auto flex flex-row gap-12 items-center">
					{/* 左カラム：タイマー・進捗バー */}
					<div className="flex-[0_0_auto] max-w-md w-full flex flex-col justify-center gap-8 items-start text-left">
						<div className="w-full text-center space-y-2">
							<h1 className="text-6xl font-bold text-white drop-shadow-lg">
								撮影中
							</h1>
							{captureMode === "time" && timeLimit && timeLeft !== null && (
								<div className="bg-black/50 backdrop-blur-sm rounded-2xl p-4 inline-block border-4 border-white shadow-2xl">
									<div className="text-7xl font-bold text-white">
										残り: {Math.floor(timeLeft / 60)}:
										{(timeLeft % 60).toString().padStart(2, "0")}
									</div>
									<div className="text-3xl font-bold text-white mt-4">
										撮影した枚数: {uploadedCount} 枚
									</div>
								</div>
							)}
						</div>
						<div className="w-full">
							<div className="w-full bg-white/30 backdrop-blur-sm h-4 rounded-full overflow-hidden">
								<div
									className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
									style={{ width: `${progressWidth}%` }}
								></div>
							</div>
						</div>
					</div>
					{/* 右カラム：カメラプレビュー */}
					<div className="flex-[0_0_auto] flex items-center justify-end">
						<Card className="overflow-hidden shadow-2xl border-4 border-black w-[min(90vh,45vw)] max-w-none ml-auto">
							<CardContent className="p-0 relative h-[90vh] flex items-center justify-center bg-black">
								<video
									ref={videoRef}
									autoPlay
									playsInline
									muted
									className="w-full h-auto object-contain z-10"
									style={{
										transform: `${
											mirror ? "scaleX(-1)" : "scaleX(1)"
										} rotate(${CAMERA_ROTATE_DEGREE}deg)`,
									}}
								/>
								{countdown !== null && (
									<div className="absolute inset-0 flex items-center justify-center bg-black/50">
										<div className="relative">
											<span className="text-white text-[15rem] font-bold leading-none">
												{countdown}
											</span>
											<div className="absolute -inset-8 border-8 border-white rounded-full animate-ping opacity-75"></div>
										</div>
									</div>
								)}
								<canvas ref={canvasRef} className="hidden" />
								{/* フレーム装飾 */}
								<div className="absolute top-0 left-0 w-20 h-20 border-t-8 border-l-8 border-white rounded-tl-3xl"></div>
								<div className="absolute top-0 right-0 w-20 h-20 border-t-8 border-r-8 border-white rounded-tr-3xl"></div>
								<div className="absolute bottom-0 left-0 w-20 h-20 border-b-8 border-l-8 border-white rounded-bl-3xl"></div>
								<div className="absolute bottom-0 right-0 w-20 h-20 border-b-8 border-r-8 border-white rounded-br-3xl"></div>
							</CardContent>
						</Card>
					</div>
				</div>
				{/* 装飾要素 */}
				<div className="fixed top-10 left-10 animate-bounce">
					<Sparkles className="h-10 w-10 text-yellow-300" />
				</div>
				<div
					className="fixed bottom-10 right-10 animate-bounce"
					style={{ animationDelay: "0.5s" }}
				>
					<Sparkles className="h-10 w-10 text-pink-300" />
				</div>
			</div>
		</div>
	);
}
