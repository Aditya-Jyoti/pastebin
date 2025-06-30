"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Eye, Lock, Globe, Copy } from "lucide-react"

interface User {
  id: string
  username: string
  email: string
  unique_code: string
}

interface Paste {
  id: string
  slug: string
  language: string
  is_public: boolean
  view_count: number
  created_at: string
  content: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [pastes, setPastes] = useState<Paste[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const authResponse = await fetch("/api/auth/me")
        if (!authResponse.ok) {
          router.push("/auth/login")
          return
        }

        const authData = await authResponse.json()
        if (!authData.user) {
          router.push("/auth/login")
          return
        }

        setUser(authData.user)

        const pastesResponse = await fetch("/api/pastes")
        if (pastesResponse.ok) {
          const pastesData = await pastesResponse.json()
          setPastes(pastesData.pastes)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        router.push("/auth/login")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/auth/login")
  }

  if (loading) {
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
          <Link href="/">
            <h1 className="text-xl font-bold text-gruvbox-yellow">pastebin</h1>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-gruvbox-fg text-sm">
              @{user?.username} ({user?.unique_code})
            </span>
            <Button variant="ghost" onClick={handleLogout} className="text-gruvbox-fg hover:bg-gruvbox-gray">
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gruvbox-yellow mb-2">Your Pastes</h2>
          <p className="text-gruvbox-fg">Total: {pastes.length} pastes</p>
        </div>

        {pastes.length === 0 ? (
          <Card className="bg-gruvbox-dark border-gruvbox-gray">
            <CardContent className="p-8 text-center">
              <p className="text-gruvbox-fg mb-4">No pastes yet.</p>
              <Link href="/">
                <Button className="bg-gruvbox-yellow text-gruvbox-bg hover:bg-gruvbox-orange font-mono">
                  Create First Paste
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {pastes.map((paste) => (
              <Card key={paste.id} className="bg-gruvbox-dark border-gruvbox-gray">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-gruvbox-fg flex items-center gap-2">
                      <Link href={`/${user?.unique_code}/${paste.slug}`} className="hover:text-gruvbox-yellow">
                        /{user?.unique_code}/{paste.slug}
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(`${window.location.origin}/${user?.unique_code}/${paste.slug}`)}
                        className="h-6 w-6 p-0 text-gruvbox-fg hover:text-gruvbox-yellow"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-gruvbox-fg border-gruvbox-gray font-mono">
                        {paste.language}
                      </Badge>
                      <Badge
                        variant={paste.is_public ? "default" : "secondary"}
                        className={
                          paste.is_public ? "bg-gruvbox-green text-gruvbox-bg" : "bg-gruvbox-red text-gruvbox-bg"
                        }
                      >
                        {paste.is_public ? (
                          <>
                            <Globe className="h-3 w-3 mr-1" /> Public
                          </>
                        ) : (
                          <>
                            <Lock className="h-3 w-3 mr-1" /> Private
                          </>
                        )}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-gruvbox-fg">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {paste.view_count}
                      </span>
                      <span>{new Date(paste.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/${user?.unique_code}/${paste.slug}`}>
                        <Button variant="ghost" size="sm" className="text-gruvbox-fg hover:text-gruvbox-yellow">
                          View
                        </Button>
                      </Link>
                      <Link href={`/${user?.unique_code}/${paste.slug}/raw`}>
                        <Button variant="ghost" size="sm" className="text-gruvbox-fg hover:text-gruvbox-yellow">
                          Raw
                        </Button>
                      </Link>
                    </div>
                  </div>
                  <div className="mt-2 p-2 bg-gruvbox-bg rounded text-xs font-mono text-gruvbox-fg truncate">
                    {paste.content.split("\n")[0]}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
