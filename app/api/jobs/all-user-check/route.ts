
import sql from "@/app/lib/neon"
import { NextResponse } from "next/server"
async function checkUptimeForAllUsers() {
  const websites = await sql`SELECT * FROM websites WHERE is_active = true`

  for (const website of websites) {
    try {
      const start = Date.now()
      const res = await fetch(website.url, { method: "GET" })
      const time = Date.now() - start

      await sql`
        INSERT INTO uptime_checks (website_id, status, response_time, status_code)
        VALUES (
          ${website.id},
          ${res.ok ? "up" : "down"},
          ${time},
          ${res.status}
        )
      `
    } catch (error) {
      await sql`
        INSERT INTO uptime_checks (website_id, status, error_message)
        VALUES (${website.id}, 'down', ${String(error)})
      `
    }
  }
}


export async function GET() {
  await checkUptimeForAllUsers()
  return NextResponse.json({ success: true })
}