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

export default function HomePage() {
	return (
		<div className="min-h-screen confetti-bg">
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
				<Card className="w-full max-w-xl mx-auto shadow-xl bg-white/90 backdrop-blur-sm border-4 border-purple-300 overflow-hidden">
					<div className="absolute -top-10 -left-10 w-40 h-40 bg-yellow-300 rounded-full opacity-30"></div>
					<div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-300 rounded-full opacity-30"></div>

					<CardHeader className="text-center p-8 relative">
						<div className="absolute top-2 left-2">
							<Star className="h-8 w-8 text-yellow-400 rotate" />
						</div>
						<div className="absolute top-2 right-2">
							<Star className="h-8 w-8 text-yellow-400 rotate" />
						</div>

						<CardTitle className="text-5xl sm:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 via-pink-600 to-red-500 drop-shadow-lg">
							とるんと
						</CardTitle>
						<CardDescription className="text-lg mt-2 font-medium">
							イベントの思い出を楽しく残そう！
						</CardDescription>
					</CardHeader>

					<CardContent className="flex flex-col items-center gap-8 p-8 relative">
						<div className="w-36 h-36 flex items-center justify-center rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 pulse">
							<Camera className="w-20 h-20 text-white" />
						</div>

						<div className="space-y-6 w-full">
							<Link href="/start" className="block">
								<Button className="w-full text-xl p-8 h-auto rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-90 shadow-lg border-2 border-white">
									<PartyPopper className="mr-2 h-8 w-8" />
									撮影スタート！
								</Button>
							</Link>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
