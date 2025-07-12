import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const TABLE_NAME =
	process.env.NEXT_PUBLIC_PHOTO_SESSION_TABLE || "PhotoSession";

export async function POST(req: NextRequest) {
	const { sessionId, files, startTime, endTime } = await req.json();
	try {
		const { error } = await supabase.from(TABLE_NAME).upsert({
			sessionId,
			photoFileNames: files,
			startTime,
			endTime,
			createdAt: new Date().toISOString(),
		});
		if (error) {
			console.log("[photo-session API] error:", error);
			console.log("[photo-session API] request body:", {
				sessionId,
				files,
				startTime,
				endTime,
			});
			return NextResponse.json(
				{ error: error.message, details: error },
				{ status: 500 }
			);
		}
		return NextResponse.json({ ok: true });
	} catch (e) {
		console.log("[photo-session API] exception:", e);
		console.log("[photo-session API] request body:", {
			sessionId,
			files,
			startTime,
			endTime,
		});
		return NextResponse.json(
			{ error: "Exception", details: e },
			{ status: 500 }
		);
	}
}
