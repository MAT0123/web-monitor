"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { CheckCircle, XCircle, Clock, Trash2, ExternalLink, Activity } from "lucide-react"

interface Website {
    id: number
    name: string
    url: string
    email: string
    is_active: boolean
    current_status: string
    avg_response_time: number
    recent_checks: Array<{
        status: string
        response_time: number
        checked_at: string
    }>
}

interface WebsiteCardProps {
    website: Website
    onUpdate: () => void
}

export function WebsiteCard({ website, onUpdate }: WebsiteCardProps) {
    const [isUpdating, setIsUpdating] = useState(false)

    const handleToggleActive = async () => {
        setIsUpdating(true)
        try {
            await fetch(`/api/websites/${website.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ is_active: !website.is_active }),

            })
            onUpdate()
        } catch (error) {
            alert(error)
        } finally {
            setIsUpdating(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this website?")) return

        try {
            await fetch(`/api/websites/${website.id}`, { method: "DELETE" })
            onUpdate()
        } catch (error) {
            alert(error)
        }
    }

    const getStatusIcon = (status: string) => {
        return status === "up" ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
        ) : (
            <XCircle className="w-5 h-5 text-red-500" />
        )
    }

    const getStatusBadge = (status: string) => {
        return <Badge variant={status === "up" ? "default" : "destructive"}>{status?.toUpperCase() || "Checking"}</Badge>
    }

    const formatResponseTime = (time: number) => {
        return time ? `${Math.round(time)}ms` : "N/A"
    }

    const getUptimePercentage = () => {
        if (!website.recent_checks || website.recent_checks.length === 0) return "N/A"

        const upChecks = website.recent_checks.filter((check) => check.status === "up").length
        const percentage = (upChecks / website.recent_checks.length) * 100
        return `${percentage.toFixed(1)}%`
    }

    return (
        <Card className={`transition-all ${!website.is_active ? "opacity-60" : ""}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-2">
                    {getStatusIcon(website.current_status)}
                    <CardTitle className="text-lg">{website.name}</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                    {getStatusBadge(website.current_status)}
                    <Switch checked={website.is_active} onCheckedChange={handleToggleActive} disabled={isUpdating} />
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ExternalLink className="w-4 h-4" />
                        <a
                            href={website.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-foreground transition-colors"
                        >
                            {website.url}
                        </a>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span>Avg: {formatResponseTime(website.avg_response_time)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-muted-foreground" />
                            <span>Uptime: {getUptimePercentage()}</span>
                        </div>
                    </div>

                    {website.recent_checks && website.recent_checks.length > 0 && (
                        <div>
                            <div className="text-sm font-medium mb-2">Recent Checks (24h)</div>
                            <div className="flex gap-1">
                                {website.recent_checks.slice(0, 24).map((check, index) => (
                                    <div
                                        key={index}
                                        className={`w-3 h-6 rounded-sm ${check.status === "up" ? "bg-green-500" : "bg-red-500"}`}
                                        title={`${check.status.toUpperCase()} - ${formatResponseTime(check.response_time)} - ${new Date(check.checked_at).toLocaleString()}`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-between items-center pt-2">
                        <span className="text-xs text-muted-foreground">Alert: {website.email}</span>
                        <Button variant="ghost" size="sm" onClick={handleDelete} className="text-red-500 hover:text-red-700">
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
