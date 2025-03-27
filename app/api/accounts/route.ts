import { NextResponse } from "next/server"

const API_KEY = process.env.UNIPILE_API_KEY
const API_URL = "https://api10.unipile.com:14091/api/v1/accounts"

export async function GET() {
  try {
    const response = await fetch(API_URL, {
      headers: {
        "X-API-KEY": API_KEY || "",
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error")
      console.error(`API error (${response.status}): ${errorText}`)
      throw new Error(`API request failed with status ${response.status}`)
    }

    const data = await response.json()

    // Handle the actual response format which has an "items" array
    if (!data || !data.items || !Array.isArray(data.items)) {
      console.error("Unexpected API response format:", data)
      return NextResponse.json({ accounts: [] })
    }

    // Map the accounts to a consistent format
    const accounts = data.items.map((account: any) => {
      // Determine connection status from sources
      const hasConnectedSource = account.sources && account.sources.some((source: any) => source.status === "OK")

      return {
        id: account.id || `account-${Math.random().toString(36).substring(2, 9)}`,
        provider: account.type || "unknown", // Using "type" instead of "provider"
        status: hasConnectedSource ? "connected" : "disconnected",
        name: account.name || "",
        created_at: account.created_at || "",
      }
    })

    return NextResponse.json({ accounts })
  } catch (error) {
    console.error("Error fetching accounts:", error)
    return NextResponse.json({ error: "Failed to fetch accounts", accounts: [] }, { status: 500 })
  }
}

