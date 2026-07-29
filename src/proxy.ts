import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// ─── mock 登录拦截：无 cs_auth cookie 一律跳 /login ──────────────────────────

export function proxy(request: NextRequest) {
  const authed = request.cookies.get("cs_auth")?.value === "1"
  const isLogin = request.nextUrl.pathname === "/login"

  if (!authed && !isLogin) {
    return NextResponse.redirect(new URL("/login", request.url))
  }
  if (authed && isLogin) {
    return NextResponse.redirect(new URL("/", request.url))
  }
  return NextResponse.next()
}

export const config = {
  // 排除静态资源与 Next 内部路径
  matcher: ["/((?!_next|favicon\\.ico|.*\\..*).*)"],
}
