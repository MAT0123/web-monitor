import sql from "@/app/lib/neon"
import { type NextRequest, NextResponse } from "next/server"
import { stackServerApp } from "@/stack"

export async function GET() {
  try {
    const user = await stackServerApp.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const websites = await sql`
      SELECT 
        w.*,
        (
          SELECT json_agg(
            json_build_object(
              'status', uc.status,
              'response_time', uc.response_time,
              'status_code', uc.status_code,
              'checked_at', uc.checked_at
            ) ORDER BY uc.checked_at DESC
          )
          FROM (
            SELECT * FROM uptime_checks 
            WHERE website_id = w.id 
            ORDER BY checked_at DESC 
            LIMIT 24
          ) uc
        ) as recent_checks,
        (
          SELECT status FROM uptime_checks 
          WHERE website_id = w.id 
          ORDER BY checked_at DESC 
          LIMIT 1
        ) as current_status,
        (
          SELECT AVG(response_time) FROM uptime_checks 
          WHERE website_id = w.id 
          AND checked_at > NOW() - INTERVAL '24 hours'
          AND status = 'up'
        ) as avg_response_time
      FROM websites w
      WHERE w.user_id = ${user.id}
      ORDER BY w.created_at DESC
    `
    return NextResponse.json(websites)
  } catch (error) {
    console.error("Failed to fetch websites:", error)
    return NextResponse.json({ error: "Failed to fetch websites" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await stackServerApp.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, url, email } = await req.json()

    if (!name || !url || !email) {
      return NextResponse.json({ error: "Name, URL, and email are required" }, { status: 400 })
    }

    try {
      new URL(url)
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 })
    }

    // Ensure the user exists in the users table
    await sql`
      INSERT INTO users (id, email, display_name)
      VALUES (${user.id}, ${user.primaryEmail}, ${user.displayName})
      ON CONFLICT (id) DO NOTHING
    `

    const result = await sql`
      INSERT INTO websites (name, url, email, user_id)
      VALUES (${name}, ${url}, ${email}, ${user.id})
      RETURNING *
    `

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Failed to create website:", error)
    return NextResponse.json({ error: "Failed to create website" }, { status: 500 })
  }
}
