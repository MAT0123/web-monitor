import nodemailer from "nodemailer"

const emailer = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
})

export async function sendDowntime(email: string, websiteName: string, url: string, error: string) {
    try {
        await emailer.sendMail({
            from: process.env.SMTP_FROM || "noreply@uptimemonitor.com",
            to: email,
            subject: `🚨 ${websiteName} is DOWN`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Website Down Alert</h2>
          <p><strong>${websiteName}</strong> is currently experiencing issues.</p>
          <p><strong>URL:</strong> ${url}</p>
          <p><strong>Error:</strong> ${error}</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            This is an automated alert from your uptime monitor.
          </p>
        </div>
      `,
        })
    } catch (error) {
        console.error("Failed to send email:", error)
    }
}

export async function sendUptimeRestored(email: string, websiteName: string, url: string) {
    try {
        await emailer.sendMail({
            from: process.env.SMTP_FROM || "noreply@uptimemonitor.com",
            to: email,
            subject: `✅ ${websiteName} is back UP`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #16a34a;">Website Restored</h2>
          <p><strong>${websiteName}</strong> is back online and responding normally.</p>
          <p><strong>URL:</strong> ${url}</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          <hr>
          <p style="color: #666; font-size: 12px;">
            This is an automated alert from your uptime monitor.
          </p>
        </div>
      `,
        })
    } catch (error) {
        console.error("Failed to send email:", error)
    }
}