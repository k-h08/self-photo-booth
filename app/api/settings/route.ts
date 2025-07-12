import { NextRequest, NextResponse } from "next/server";

export async function GET() {
	return NextResponse.json({
		captureMode: process.env.NEXT_PUBLIC_CAPTURE_MODE || "time",
		photoCount: Number(process.env.NEXT_PUBLIC_PHOTO_COUNT) || 4,
		timeLimit: Number(process.env.NEXT_PUBLIC_TIME_LIMIT) || 3,
		allowUserChoice: process.env.NEXT_PUBLIC_ALLOW_USER_CHOICE === "true",
		deliveryMethod: process.env.NEXT_PUBLIC_DELIVERY_METHOD || "qr",
		mirror: process.env.NEXT_PUBLIC_MIRROR === "true",
	});
}

export async function POST() {
	return NextResponse.json(
		{ ok: false, message: "envからのみ取得可能です" },
		{ status: 405 }
	);
}
