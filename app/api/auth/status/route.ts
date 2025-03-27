import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get("unipile_access_token")?.value

    if (!accessToken) {
      return NextResponse.json({ authenticated: false, error: "No access token found." }, { status: 401 })
    }

    // Fetch user connections from Unipile API
    const userResponse = await fetch("https://api.unipile.com/v1/connections", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!userResponse.ok) {
      console.error(`Unipile API Error (${userResponse.status}):`, await userResponse.text())
      return NextResponse.json({ authenticated: false, error: "Failed to fetch user data" }, { status: 500 })
    }

    const userData = await userResponse.json()

    if (!userData || !userData.data) {
      return NextResponse.json({ authenticated: false, error: "Invalid response from Unipile API" }, { status: 500 })
    }

    // Format connections data
    const connections = userData.data.map((connection: any) => ({
      provider: connection.provider,
      connected: connection.status === "connected",
    }))

    return NextResponse.json({
      authenticated: true,
      connections,
    })
  } catch (error) {
    console.error("Server Error:", error)
    return NextResponse.json({ authenticated: false, error: "Internal server error" }, { status: 500 })
  }
}
