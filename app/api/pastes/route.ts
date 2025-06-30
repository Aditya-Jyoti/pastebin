import { type NextRequest, NextResponse } from "next/server"
import { pool } from "@/lib/db"
import { getUserFromToken } from "@/lib/auth"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const user = await getUserFromToken(token)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const { slug, content, language, isPublic, password } = await request.json()
    
    // Check if slug exists for this user
    const existingPaste = await pool.query("SELECT id FROM pastes WHERE user_id = $1 AND slug = $2", [user.id, slug])
    if (existingPaste.rows.length > 0) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 400 })
    }
    
    const pasteId = uuidv4()
    const result = await pool.query(
      "INSERT INTO pastes (id, user_id, slug, content, language, is_public, password) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [pasteId, user.id, slug, content, language, isPublic, password],
    )
    return NextResponse.json({ paste: result.rows[0] })
  } catch (error) {
    console.error("Create paste error:", error)
    return NextResponse.json({ error: "Failed to create paste" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const user = await getUserFromToken(token)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // First, let's check what columns actually exist in your table
    // Use SELECT * to get all columns, then we can see the actual structure
    const result = await pool.query(
      "SELECT * FROM pastes WHERE user_id = $1 ORDER BY id DESC", 
      [user.id]
    )
    
    return NextResponse.json({ pastes: result.rows })
  } catch (error) {
    console.error("Get pastes error:", error)
    return NextResponse.json({ error: "Failed to get pastes" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const user = await getUserFromToken(token)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get paste ID from request body
    const { pasteId } = await request.json()
    
    if (!pasteId) {
      return NextResponse.json({ error: "Paste ID required" }, { status: 400 })
    }

    // Check if paste exists and belongs to user
    const existingPaste = await pool.query(
      "SELECT id FROM pastes WHERE id = $1 AND user_id = $2", 
      [pasteId, user.id]
    )
    
    if (existingPaste.rows.length === 0) {
      return NextResponse.json({ error: "Paste not found or unauthorized" }, { status: 404 })
    }

    // Delete the paste
    await pool.query("DELETE FROM pastes WHERE id = $1 AND user_id = $2", [pasteId, user.id])
    
    return NextResponse.json({ message: "Paste deleted successfully" })
  } catch (error) {
    console.error("Delete paste error:", error)
    return NextResponse.json({ error: "Failed to delete paste" }, { status: 500 })
  }
}
