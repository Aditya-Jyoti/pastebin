"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SyntaxHighlighter } from "@/components/syntax-highlighter"
import Link from "next/link"
import { Copy, Eye, Lock, Globe } from "lucide-react"
import ReactMarkdown from "react-markdown"

interface Paste {
  id: string
  slug: string
  content: string
  language: string
  is_public: boolean
  password: string | null
  view_count: number
  created_at: string
  user_id: string
}

export default function PastePage() {
  const params = useParams()
  const router = useRouter()
  const [paste, setPaste] = useState<Paste | null>(null)
  const [loading, setLoading] = useState(true)
  const [passwordRequired, setPasswordRequired] = useState(false)
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const userCode = params.userCode as string
  const slug = params.slug as string

  useEffect(() => {
    const fetchPaste = async () => {
      try {
        const response = await fetch(`/api/pastes/${userCode}/${slug}`)
        if (!response.ok) {
          router.push("/404")
          return
        }

        const data = await response.json()
        const pasteData = data.paste

        if (!pasteData.is_public && pasteData.password) {
          setPasswordRequired(true)
          setPaste(pasteData)
        } else {
          setPaste(pasteData)
        }
      } catch (error) {
        console.error("Error fetching paste:", error)
        router.push("/404")
      } finally {
        setLoading(false)
      }
    }

    fetchPaste()
  }, [userCode, slug, router])

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!paste) return

    if (password === paste.password) {
      setPasswordRequired(false)
    } else {
      setError("Incorrect password")
    }
  }

  const copyToClipboard = () => {
    if (paste) {
      navigator.clipboard.writeText(paste.content)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gruvbox-bg flex items-center justify-center">
        <div className="text-gruvbox-fg font-mono">Loading...</div>
      </div>
    )
  }

  if (passwordRequired) {
    return (
      <div className="min-h-screen bg-gruvbox-bg flex items-center justify-center p-4 font-mono">
        <Card className="w-full max-w-md bg-gruvbox-dark border-gruvbox-gray">
          <CardHeader className="text-center">
            <CardTitle className="text-gruvbox-yellow flex items-center justify-center gap-2">
              <Lock className="h-5 w-5" />
              Private Paste
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
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
              {error && <p className="text-gruvbox-red text-sm">{error}</p>}
              <Button
                type="submit"
                className="w-full bg-gruvbox-yellow text-gruvbox-bg hover:bg-gruvbox-orange font-mono"
              >
                Access Paste
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!paste) {
    return (
      <div className="min-h-screen bg-gruvbox-bg flex items-center justify-center">
        <div className="text-gruvbox-fg font-mono">Paste not found</div>
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
            <Badge variant="outline" className="text-gruvbox-fg border-gruvbox-gray font-mono">
              {paste.language}
            </Badge>
            <Badge
              variant={paste.is_public ? "default" : "secondary"}
              className={paste.is_public ? "bg-gruvbox-green text-gruvbox-bg" : "bg-gruvbox-red text-gruvbox-bg"}
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
            <span className="flex items-center gap-1 text-gruvbox-fg">
              <Eye className="h-4 w-4" />
              {paste.view_count}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gruvbox-yellow">
            /{userCode}/{paste.slug}
          </h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={copyToClipboard}
              className="border-gruvbox-gray text-gruvbox-fg hover:bg-gruvbox-gray bg-transparent font-mono"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
            <Link href={`/${userCode}/${paste.slug}/raw`}>
              <Button
                variant="outline"
                className="border-gruvbox-gray text-gruvbox-fg hover:bg-gruvbox-gray bg-transparent font-mono"
              >
                Raw
              </Button>
            </Link>
          </div>
        </div>

        <Card className="bg-gruvbox-dark border-gruvbox-gray">
          <CardContent className="p-0">
            {paste.language === "markdown" ? (
              <div className="p-6 prose prose-invert max-w-none">
                <ReactMarkdown className="text-gruvbox-fg">{paste.content}</ReactMarkdown>
              </div>
            ) : (
              <SyntaxHighlighter code={paste.content} language={paste.language} />
            )}
          </CardContent>
        </Card>

        <div className="mt-4 text-sm text-gruvbox-fg">Created {new Date(paste.created_at).toLocaleDateString()}</div>
      </main>
    </div>
  )
}
