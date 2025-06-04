import { NextResponse } from "next/server"
import { sendDowntime, sendUptimeRestored } from "@/app/lib/email"
import sql from "@/app/lib/neon"

export async function GET() {
    try {
        // Get all active websites
        const websites = await sql`
      SELECT * FROM websites WHERE is_active = true
    `

        for (const website of websites) {
            const startTime = Date.now()
            let status = "down"
            let responseTime = 0
            let statusCode = 0
            let errorMessage = ""

            try {
                const response = await fetch(website.url, {
                    method: "GET",

                })

                responseTime = Date.now() - startTime
                statusCode = response.status

                if (response.ok) {
                    status = "up"
                } else {
                    status = "down"
                    errorMessage = `HTTP ${response.status}: ${response.statusText}`
                }
            } catch (error) {
                responseTime = Date.now() - startTime
                status = "down"
                errorMessage = error instanceof Error ? error.message : "Unknown error"
            }

            // Get the last check to see if status changed
            const lastCheck = await sql`
        SELECT status FROM uptime_checks 
        WHERE website_id = ${website.id} 
        ORDER BY checked_at DESC 
        LIMIT 1
      `

            const previousStatus = lastCheck[0]?.status

            // Insert the new check
            await sql`
        INSERT INTO uptime_checks (website_id, status, response_time, status_code, error_message)
        VALUES (${website.id}, ${status}, ${responseTime}, ${statusCode}, ${errorMessage})
      `

            // Send email alerts for status changes
            if (previousStatus && previousStatus !== status) {
                if (status === "down") {
                    await sendDowntime(website.email, website.name, website.url, errorMessage)
                } else if (status === "up" && previousStatus === "down") {
                    await sendUptimeRestored(website.email, website.name, website.url)
                }
            }
        }
        //await sendDowntime("matthewaureliustjoa@gmail.com", " website.name", "website.url", "errorMessage")
        return NextResponse.json({
            success: true,
            message: `Checked ${websites.length} websites`,
        })
    } catch (error) {
        console.error("Uptime check failed:", error)
        return NextResponse.json({ success: false, error: "Failed to check uptime" }, { status: 500 })
    }
}
