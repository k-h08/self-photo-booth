"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Camera, Sparkles, Star, PartyPopper, Settings } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
	const router = useRouter();
	const [showCountdown, setShowCountdown] = useState(false);
	const [countdown, setCountdown] = useState(3);

	const handleStartRecording = () => {
		setShowCountdown(true);
		setCountdown(3);

		const timer = setInterval(() => {
			setCountdown((prev) => {
				if (prev <= 1) {
					clearInterval(timer);
					setTimeout(() => {
						router.push("/camera");
					}, 100);
					return 0;
				}
				return prev - 1;
			});
		}, 1000);
	};

	return (
		<div className="min-h-screen confetti-bg">
			{/* 3秒カウントダウンオーバーレイ */}
			{showCountdown && (
				<div className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center">
					<div className="text-center">
						<span className="text-white text-[20rem] font-bold leading-none">
							{countdown}
						</span>
						<div className="absolute -inset-8 border-8 border-white rounded-full animate-ping opacity-75"></div>
						<p className="text-white text-3xl mt-8">撮影開始まで</p>
					</div>
				</div>
			)}

			<Link href="/admin" className="fixed top-6 right-6 z-50">
				<Button
					variant="ghost"
					size="icon"
					className="rounded-full p-3 bg-white/80 hover:bg-white shadow-lg border-2 border-purple-300"
				>
					<Settings className="h-8 w-8 text-purple-500" />
				</Button>
			</Link>
			<div className="container flex items-center justify-center min-h-screen p-4 sm:p-6">
				<Card className="w-full max-w-4xl mx-auto shadow-xl bg-white/90 backdrop-blur-sm border-4 border-purple-300 overflow-hidden">
					<div className="absolute -top-16 -left-16 w-60 h-60 bg-yellow-300 rounded-full opacity-30"></div>
					<div className="absolute -bottom-16 -right-16 w-60 h-60 bg-blue-300 rounded-full opacity-30"></div>

					<CardHeader className="text-center p-12 relative">
						<div className="absolute top-4 left-4">
							<Star className="h-12 w-12 text-yellow-400 rotate" />
						</div>
						<div className="absolute top-4 right-4">
							<Star className="h-12 w-12 text-yellow-400 rotate" />
						</div>

						<CardTitle className="text-6xl sm:text-8xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 via-pink-600 to-red-500 drop-shadow-lg">
							とるんと
						</CardTitle>
						<CardDescription className="text-2xl mt-4 font-medium">
							イベントの思い出を楽しく残そう！
						</CardDescription>
					</CardHeader>

					<CardContent className="flex flex-col items-center gap-12 p-12 relative">
						<div className="w-48 h-48 flex items-center justify-center rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 pulse">
							<Camera className="w-28 h-28 text-white" />
						</div>

						<div className="space-y-8 w-full">
							<Button
								className="w-full text-3xl p-12 h-auto rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-90 shadow-lg border-4 border-white"
								onClick={handleStartRecording}
								disabled={showCountdown}
							>
								<PartyPopper className="mr-4 h-12 w-12" />
								撮影スタート！
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
