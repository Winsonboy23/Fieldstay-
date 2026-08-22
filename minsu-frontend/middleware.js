// import { NextResponse } from "next/server";

// export function middleware(request) {
//   console.log(request);

//   return NextResponse.redirect(new URL("/about", request.url));
// }

import { auth } from "@/app/_lib/auth";

export const middleware = auth;

export const config = {
  // /checkout 開放訪客結帳，不再強制登入
  matcher: ["/account/:path*"],
};
