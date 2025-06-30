import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { pool } from "./db"
import type { User } from "./db"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "30d" })
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string }
  } catch {
    return null
  }
}

export async function getUserFromToken(token: string): Promise<User | null> {
  const payload = verifyToken(token)
  if (!payload) return null

  const result = await pool.query("SELECT * FROM users WHERE id = $1", [payload.userId])
  return result.rows[0] || null
}

export function generateUniqueCode(): string {
  return Math.random().toString(36).substring(2, 5).toUpperCase()
}
