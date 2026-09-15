import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
	return await updateSession(request);
}

export const config = {
	matcher: [
		// 정적 파일, 이미지 최적화, 아이콘(app/icon.tsx, app/apple-icon.tsx) 요청은 세션 갱신이 필요 없다
		"/((?!_next/static|_next/image|icon$|apple-icon$|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
	],
};
