import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
})

export { pool }

export interface User {
  id: string
  username: string
  email: string
  password_hash: string
  unique_code: string
  created_at: string
}

export interface Paste {
  id: string
  user_id: string
  slug: string
  content: string
  language: string
  is_public: boolean
  password: string | null
  view_count: number
  created_at: string
}
