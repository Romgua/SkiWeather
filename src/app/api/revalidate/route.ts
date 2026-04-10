import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { stations } from "@/lib/stations";

// Appelé par le cron Vercel — Vercel injecte Authorization: Bearer <CRON_SECRET>
// Peut aussi être appelé manuellement avec ?secret=<CRON_SECRET>
export async function GET(request: NextRequest) {
    const cronSecret = process.env.CRON_SECRET;

    const authHeader = request.headers.get("authorization");
    const querySecret = request.nextUrl.searchParams.get("secret");

    const isAuthorized =
        (cronSecret && authHeader === `Bearer ${cronSecret}`) ||
        (cronSecret && querySecret === cronSecret);

    if (!isAuthorized) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    revalidatePath("/");
    revalidatePath("/comparer");
    for (const station of stations) {
        revalidatePath(`/station/${station.slug}`);
    }

    return NextResponse.json({
        revalidated: true,
        paths: 2 + stations.length,
        timestamp: new Date().toISOString(),
    });
}
