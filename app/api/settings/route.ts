import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
	const data = await req.json();
	// id=1の設定を上書き（なければ新規作成）
	const setting = await prisma.setting.upsert({
		where: { id: 1 },
		update: data,
		create: { id: 1, ...data },
	});
	return NextResponse.json(setting);
}

export async function GET() {
	const setting = await prisma.setting.findUnique({ where: { id: 1 } });
	return NextResponse.json(setting);
}
