import { NextResponse } from "next/server"

export async function GET() {
  // Generate a random state for security
  const state = Math.random().toString(36).substring(2, 15)

  // Store the state in a cookie for verification when the user returns
  const response = NextResponse.redirect(
    `https://auth.unipile.com/oauth/authorize?client_id=${process.env.UNIPILE_CLIENT_ID}&redirect_uri=${encodeURIComponent(
      process.env.UNIPILE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
    )}&state=${state}&response_type=code`,
  )

  // Set a cookie with the state
  response.cookies.set("unipile_auth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 10, // 10 minutes
    path: "/",
  })

  return response
}

