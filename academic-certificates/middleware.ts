import { updateSession } from "@/lib/supabase/middleware";
import { type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Only run middleware on routes that actually need authentication:
     * - /student (student dashboard)
     * - /admin (admin dashboard)
     * - /academy (academy content)
     * 
     * All other routes are public and don't need auth checks
     */
    "/student/:path*",
    "/admin/:path*",
    "/academy/:path*",
  ],
};
