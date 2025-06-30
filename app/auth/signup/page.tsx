"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function SignupPage() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      })

      if (response.ok) {
        router.push("/")
      } else {
        const data = await response.json()
        setError(data.error || "Signup failed")
      }
    } catch (error) {
      setError("Signup failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gruvbox-bg flex items-center justify-center p-4 font-mono">
      <Card className="w-full max-w-md bg-gruvbox-dark border-gruvbox-gray">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-gruvbox-yellow">Sign Up</CardTitle>
          <CardDescription className="text-gruvbox-fg">Create your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <Label htmlFor="username" className="text-gruvbox-fg">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="bg-gruvbox-bg border-gruvbox-gray text-gruvbox-fg font-mono"
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-gruvbox-fg">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-gruvbox-bg border-gruvbox-gray text-gruvbox-fg font-mono"
              />
            </div>
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
              disabled={loading}
              className="w-full bg-gruvbox-yellow text-gruvbox-bg hover:bg-gruvbox-orange font-mono"
            >
              {loading ? "Creating account..." : "Sign Up"}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <p className="text-gruvbox-fg text-sm">
              Have an account?{" "}
              <Link href="/auth/login" className="text-gruvbox-blue hover:underline">
                Login
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
