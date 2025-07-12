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
	const [allowUserChoice, setAllowUserChoice] = useState(true);
	const [deliveryMethod, setDeliveryMethod] = useState("qr");
	const [authOpen, setAuthOpen] = useState(true);
	const [password, setPassword] = useState("");
	const [authError, setAuthError] = useState("");

	useEffect(() => {
		const fetchSettings = async () => {
			const res = await fetch("/api/settings");
			if (res.ok) {
				const data = await res.json();
				if (data) {
					setCaptureMode("time");
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

	const handleDialogOpenChange = (open: boolean) => {
		setAuthOpen(open);
		if (!open) {
			router.push("/");
		}
	};

	return (
		<div className="min-h-screen gradient-bg">
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
				<Card className="w-full max-w-4xl mx-auto shadow-xl bg-white/90 backdrop-blur-sm border-4 border-purple-300 overflow-hidden">
					<CardHeader className="text-center p-12 relative">
						<CardTitle className="text-4xl font-extrabold text-purple-700 mb-2">
							管理者設定（表示のみ）
						</CardTitle>
						<CardDescription className="text-lg mt-2 font-medium">
							現在の設定値を表示しています（編集不可）
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-8 p-12">
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<span className="font-bold">撮影モード</span>
								<span className="text-lg">
									{captureMode === "time" ? "時間制限" : "枚数制限"}
								</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="font-bold">制限時間（秒）</span>
								<span className="text-lg">{timeLimit}</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="font-bold">カメラ反転</span>
								<span className="text-lg">{mirror ? "ON" : "OFF"}</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="font-bold">受け取り方法</span>
								<span className="text-lg">
									{deliveryMethod === "qr" ? "QRコード" : deliveryMethod}
								</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="font-bold">ユーザー選択可</span>
								<span className="text-lg">
									{allowUserChoice ? "可" : "不可"}
								</span>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
