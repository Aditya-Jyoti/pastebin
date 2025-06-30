"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import Link from "next/link"

const LANGUAGES = [
  "plaintext",
  "javascript",
  "typescript",
  "python",
  "java",
  "cpp",
  "c",
  "csharp",
  "php",
  "ruby",
  "go",
  "rust",
  "swift",
  "kotlin",
  "html",
  "css",
  "sql",
  "json",
  "xml",
  "yaml",
  "markdown",
  "bash",
  "dockerfile",
]

interface User {
  id: string
  username: string
  email: string
  unique_code: string
}

export default function HomePage() {
  const [content, setContent] = useState("")
  const [customSlug, setCustomSlug] = useState("")
  const [language, setLanguage] = useState("plaintext")
  const [isPublic, setIsPublic] = useState(true)
  const [password, setPassword] = useState("")
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me")
        if (response.ok) {
          const data = await response.json()
          if (data.user) {
            setUser(data.user)
          } else {
            router.push("/auth/login")
          }
        } else {
          router.push("/auth/login")
        }
      } catch (error) {
        console.error("Auth check failed:", error)
        router.push("/auth/login")
      } finally {
        setAuthLoading(false)
      }
    }
    checkAuth()
  }, [router])

  const generateSlug = () => {
    return Math.random().toString(36).substring(2, 8)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    const slug = customSlug || generateSlug()

    try {
      const response = await fetch("/api/pastes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          content,
          language,
          isPublic,
          password: !isPublic ? password : null,
        }),
      })

      if (response.ok) {
        router.push(`/${user.unique_code}/${slug}`)
      } else {
        const data = await response.json()
        alert(data.error || "Failed to create paste")
      }
    } catch (error) {
      console.error("Error creating paste:", error)
      alert("Failed to create paste")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    setUser(null)
    router.push("/auth/login")
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gruvbox-bg flex items-center justify-center">
        <div className="text-gruvbox-fg font-mono">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gruvbox-bg text-gruvbox-fg font-mono">
      {/* Header */}
      <header className="bg-gruvbox-dark border-b border-gruvbox-gray p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-gruvbox-yellow">pastebin</h1>
          <div className="flex items-center gap-4">
            <span className="text-gruvbox-fg text-sm">
              @{user?.username} ({user?.unique_code})
            </span>
            <Link href="/dashboard">
              <Button variant="ghost" className="text-gruvbox-fg hover:bg-gruvbox-gray">
                Dashboard
              </Button>
            </Link>
            <Button variant="ghost" onClick={handleLogout} className="text-gruvbox-fg hover:bg-gruvbox-gray">
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6">
        <Card className="bg-gruvbox-dark border-gruvbox-gray p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Controls */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="slug" className="text-gruvbox-fg">
                  Custom Slug
                </Label>
                <Input
                  id="slug"
                  value={customSlug}
                  onChange={(e) => setCustomSlug(e.target.value)}
                  placeholder="my-code"
                  className="bg-gruvbox-bg border-gruvbox-gray text-gruvbox-fg font-mono"
                />
              </div>

              <div>
                <Label className="text-gruvbox-fg">Language</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="bg-gruvbox-bg border-gruvbox-gray text-gruvbox-fg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gruvbox-dark border-gruvbox-gray">
                    {LANGUAGES.map((lang) => (
                      <SelectItem key={lang} value={lang} className="text-gruvbox-fg hover:bg-gruvbox-gray">
                        {lang}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2 pt-6">
                <Switch id="public" checked={isPublic} onCheckedChange={setIsPublic} />
                <Label htmlFor="public" className="text-gruvbox-fg">
                  Public
                </Label>
              </div>

              {!isPublic && (
                <div>
                  <Label htmlFor="password" className="text-gruvbox-fg">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-gruvbox-bg border-gruvbox-gray text-gruvbox-fg font-mono"
                  />
                </div>
              )}
            </div>

            {/* Content */}
            <div>
              <Label htmlFor="content" className="text-gruvbox-fg">
                Content
              </Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste your code here..."
                className="min-h-96 bg-gruvbox-bg border-gruvbox-gray text-gruvbox-fg font-mono text-sm"
                required
              />
            </div>

            {/* Submit */}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={loading}
                className="bg-gruvbox-yellow text-gruvbox-bg hover:bg-gruvbox-orange font-mono"
              >
                {loading ? "Creating..." : "Create Paste"}
              </Button>
            </div>
          </form>
        </Card>
      </main>
    </div>
  )
}
