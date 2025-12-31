import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtDecode } from "jwt-decode";
import api from "@/lib/axios";

interface JwtPayload {
  id: number;
  name: string;
  email: string;
  division: "Vendor" | "Dalkon" | "Engineering" | "Manager";
  exp: number;
}

// DAFTAR ROUTE PER ROLE 
const ROUTES = {
  Vendor: [
    "/documents/vendor-upload",
    "/approval-history",
    "/approval-progress",
  ],
  Engineering: [
    "/documents/review-approval",
    "/approval-history",
    "/approval-progress",
  ],
  Dalkon: [
    "/documents/review-management",
    "/approval-history",
    "/approval-progress",
  ],
  Manager: [
    "/documents/review-management",
    "/approval-history",
    "/approval-progress",
  ],
};

const PUBLIC_ROUTES = ["/auth/login", "/auth/register"];
const PROTECTED_ROUTES = [
  "/dashboard",
  "/documents",
  "/approval-history",
  "/approval-progress",
  "/documents/vendor-upload",
  "/documents/review-approval",
  "/documents/review-management",
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;

  //  Biarkan route publik
  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  //  Tidak ada token → login
  if (!accessToken && !refreshToken) {
    return redirectToLogin(request);
  }

  //  Decode access token
  let payload: JwtPayload | null = null;
  if (accessToken) {
    try {
      payload = jwtDecode<JwtPayload>(accessToken);
    } catch (error) {
      console.error("Invalid token:", error);
    }
  }

  //  Token expired → refresh
  if (!payload || payload.exp < Date.now() / 1000) {
    if (!refreshToken) return redirectToLogin(request);

    try {
      const refreshResponse = await api.post(
        "/auth/refresh",
        { refreshToken },
        {
          headers: {
            Cookie: `refresh_token=${refreshToken}`,
          },
        }
      );

      const { accessToken: newAccessToken } = refreshResponse.data;

      const response = NextResponse.next();
      response.cookies.set("access_token", newAccessToken, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 15 * 60, // 15 menit
      });

      payload = jwtDecode<JwtPayload>(newAccessToken);
      return response;
    } catch (error: any) {
      console.error("Refresh token gagal:", error.response?.data || error.message);
      return redirectToLogin(request);
    }
  }

  // ROLE-BASED ACCESS CONTROL
  const { division } = payload;
  const allowedRoutes = ROUTES[division];

  if (allowedRoutes && !allowedRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Protected route tanpa token → login
  if (PROTECTED_ROUTES.some((route) => pathname.startsWith(route)) && !payload) {
    return redirectToLogin(request);
  }

  return NextResponse.next();
}

function redirectToLogin(request: NextRequest) {
  const loginUrl = new URL("/auth/login", request.url);
  loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};