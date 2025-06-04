import sql from '@/app/lib/neon';
import { NextRequest, NextResponse } from 'next/server';
async function checkUptimeForAllUsers() {
    const websites = await sql`SELECT * FROM websites WHERE is_active = true`;

    for (const website of websites) {
        try {
            const start = Date.now();
            const res = await fetch(website.url, { method: 'GET' });
            const time = Date.now() - start;

            await sql`
        INSERT INTO uptime_checks (website_id, status, response_time, status_code)
        VALUES (
          ${website.id},
          ${res.ok ? 'up' : 'down'},
          ${time},
          ${res.status}
        )
      `;
        } catch (error) {
            await sql`
        INSERT INTO uptime_checks (website_id, status, error_message)
        VALUES (${website.id}, 'down', ${String(error)})
      `;
        }
    }
}

export async function GET(req: NextRequest): Promise<NextResponse> {
    if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ "Rejected": "You are not authorized" }, { status: 401 })
    }
    await checkUptimeForAllUsers();
    return NextResponse.json({ success: true });
}
