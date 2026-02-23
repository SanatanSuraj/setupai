import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const publicPaths = ["/", "/pricing", "/contact", "/login", "/register"];
const dashboardPath = "/dashboard";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Allow everyone (including logged-in users) to see the landing page at /
    if (path.startsWith(dashboardPath) && !token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const tier = (token?.subscriptionTier as string) ?? "free";
    const proModules = ["/dashboard/licensing", "/dashboard/qc", "/dashboard/finance"];
    const enterpriseModules = ["/dashboard/operations"]; // multi-location / franchise could live here

    if (proModules.some((m) => path.startsWith(m)) && tier === "free") {
      return NextResponse.redirect(new URL("/dashboard?upgrade=pro", req.url));
    }
    if (enterpriseModules.some((m) => path.startsWith(m)) && tier !== "enterprise") {
      return NextResponse.redirect(new URL("/dashboard?upgrade=enterprise", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const path = req.nextUrl.pathname;
        if (path.startsWith("/dashboard")) return !!token;
        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/", "/dashboard/:path*", "/login", "/register", "/pricing", "/contact"],
};
