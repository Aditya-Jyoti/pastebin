"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"

interface Paste {
  content: string
}

export default function RawPastePage() {
  const params = useParams()
  const router = useRouter()
  const [paste, setPaste] = useState<Paste | null>(null)
  const [loading, setLoading] = useState(true)

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
        setPaste(data.paste)
      } catch (error) {
        console.error("Error fetching paste:", error)
        router.push("/404")
      } finally {
        setLoading(false)
      }
    }

    fetchPaste()
  }, [userCode, slug, router])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!paste) {
    return <div>Paste not found</div>
  }

  return <pre style={{ margin: 0, padding: 0, fontFamily: "monospace", whiteSpace: "pre-wrap" }}>{paste.content}</pre>
}
