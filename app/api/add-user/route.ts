
import { neon } from '@neondatabase/serverless'
import { stackServerApp } from "@/stack";
import { NextResponse } from 'next/server'

const sql = neon(process.env.DATABASE_URL!) // Neon PostgreSQL connection

export async function POST(req: Request) {
    const user = await stackServerApp.getUser()
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, url, email } = await req.json()

    await sql`
    INSERT INTO users (id, email, display_name)
    VALUES (${user.id}, ${user.primaryEmail}, ${user.displayName})
    ON CONFLICT (id) DO NOTHING
  `

    await sql`
    INSERT INTO websites (name, url, email, user_id)
    VALUES (${name}, ${url}, ${email}, ${user.id})
  `

    return NextResponse.json({ success: true })
}
