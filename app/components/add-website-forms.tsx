"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { useUser } from "@stackframe/stack"
import { checkEmail } from "../lib/check-email"
import { checkURL } from "../lib/check-link"

interface AddWebsiteFormProps {
    onWebsiteAdded: () => void
}

export function AddWebsiteForm({ onWebsiteAdded }: AddWebsiteFormProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const user = useUser()
    const [formData, setFormData] = useState({
        name: "",
        url: "",
        email: user?.primaryEmail,
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            if (!checkEmail(formData.email ?? "") && !checkURL(formData.url ?? "")) {
                setIsLoading(false)
                throw new Error("Invalid email or url")
            }
            const response = await fetch("/api/websites", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })

            if (response.ok) {
                setFormData({ name: "", url: "", email: "" })
                setIsOpen(false)
                onWebsiteAdded()
                
            } else {
                const error = await response.json()
                throw (error.error || "Failed to add website")
            }
        } catch (error) {
            alert(error)
        } finally {
            setIsLoading(false)
        }
    }

    if (!isOpen) {
        return (
            <Button onClick={() => setIsOpen(true)} className="mb-6">
                <Plus className="w-4 h-4 mr-2" />
                Add Website
            </Button>
        )
    }

    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle>Add New Website</CardTitle>
                <CardDescription>Monitor a new website for uptime and response times</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="name">Website Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="My Website"
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="url">URL</Label>
                            <Input
                                id="url"
                                type="url"
                                value={formData.url}
                                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                placeholder="https://example.com"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="email">Alert Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={formData.email!}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="alerts@example.com"
                            required
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Adding..." : "Add Website"}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
