import { type NextRequest, NextResponse } from "next/server"
import { pool } from "@/lib/db"
import { hashPassword, generateToken, generateUniqueCode } from "@/lib/auth"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: NextRequest) {
  try {
    const { username, email, password } = await request.json()

    if (!username || !email || !password) {
      return NextResponse.json({ error: "Username, email and password required" }, { status: 400 })
    }

    // Check if user exists
    const existingUser = await pool.query("SELECT id FROM users WHERE email = $1 OR username = $2", [email, username])
    if (existingUser.rows.length > 0) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    const passwordHash = await hashPassword(password)
    let uniqueCode: string

    // Generate unique code
    do {
      uniqueCode = generateUniqueCode()
      const codeCheck = await pool.query("SELECT id FROM users WHERE unique_code = $1", [uniqueCode])
      if (codeCheck.rows.length === 0) break
    } while (true)

    const userId = uuidv4()
    const result = await pool.query(
      "INSERT INTO users (id, username, email, password_hash, unique_code) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [userId, username, email, passwordHash, uniqueCode],
    )

    const user = result.rows[0]
    const token = generateToken(user.id)
    const response = NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        unique_code: user.unique_code,
      },
    })

    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })

    return response
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "Signup failed" }, { status: 500 })
  }
}
