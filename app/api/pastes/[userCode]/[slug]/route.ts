import { type NextRequest, NextResponse } from "next/server"
import { pool } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { userCode: string; slug: string } }) {
  try {
    const { userCode, slug } = params

    // Get user by unique code
    const userResult = await pool.query("SELECT id FROM users WHERE unique_code = $1", [userCode])
    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const userId = userResult.rows[0].id

    // Get paste
    const pasteResult = await pool.query("SELECT * FROM pastes WHERE user_id = $1 AND slug = $2", [userId, slug])
    if (pasteResult.rows.length === 0) {
      return NextResponse.json({ error: "Paste not found" }, { status: 404 })
    }

    const paste = pasteResult.rows[0]

    // Increment view count
    await pool.query("UPDATE pastes SET view_count = view_count + 1 WHERE id = $1", [paste.id])

    return NextResponse.json({ paste: { ...paste, view_count: paste.view_count + 1 } })
  } catch (error) {
    console.error("Get paste error:", error)
    return NextResponse.json({ error: "Failed to get paste" }, { status: 500 })
  }
}
