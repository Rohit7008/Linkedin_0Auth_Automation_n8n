import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const state = searchParams.get("state")

  // Verify the state parameter matches what we set in the cookie
  const storedState = request.cookies.get("unipile_auth_state")?.value

  if (!code || !state || state !== storedState) {
    return NextResponse.redirect(new URL("/?error=invalid_state", request.url))
  }

  try {
    // Exchange the code for an access token
    const tokenResponse = await fetch("https://auth.unipile.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.UNIPILE_CLIENT_ID,
        client_secret: process.env.UNIPILE_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: process.env.UNIPILE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
      }),
    })

    if (!tokenResponse.ok) {
      throw new Error(`Token exchange failed: ${tokenResponse.statusText}`)
    }

    const tokenData = await tokenResponse.json()

    // Store the access token in a secure cookie
    const response = NextResponse.redirect(new URL("/dashboard", request.url))

    response.cookies.set("unipile_access_token", tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: tokenData.expires_in || 60 * 60 * 24, // Default to 24 hours if not provided
      path: "/",
    })

    // Clear the state cookie
    response.cookies.set("unipile_auth_state", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 0,
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Authentication error:", error)
    return NextResponse.redirect(new URL("/?error=auth_failed", request.url))
  }
}

