import sql from "@/app/lib/neon"
import { type NextRequest, NextResponse } from "next/server"

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const ids = (await context.params).id
        const id = Number.parseInt(ids)

        await sql`DELETE FROM websites WHERE id = ${id}`

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Failed to delete website:", error)
        return NextResponse.json({ error: "Failed to delete website" }, { status: 500 })
    }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const ids = (await context.params).id
        const id = Number.parseInt(ids)
        const { is_active } = await request.json()

        const result = await sql`
      UPDATE websites 
      SET is_active = ${is_active}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `

        return NextResponse.json(result[0])
    } catch (error) {
        console.error("Failed to update website:", error)
        return NextResponse.json({ error: "Failed to update website" }, { status: 500 })
    }
}
