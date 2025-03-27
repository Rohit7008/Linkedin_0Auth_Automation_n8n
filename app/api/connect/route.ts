import { type NextRequest, NextResponse } from "next/server"

const API_KEY = process.env.UNIPILE_API_KEY
const API_BASE_URL = "https://api10.unipile.com:14091/api/v1"

export async function POST(request: NextRequest) {
  try {
    const { provider } = await request.json()

    if (!provider) {
      return NextResponse.json({ error: "Provider is required" }, { status: 400 })
    }

    // First, check if we need to create an account for this provider
    const accountsResponse = await fetch(`${API_BASE_URL}/accounts`, {
      headers: {
        "X-API-KEY": API_KEY || "",
        Accept: "application/json",
      },
    })

    if (!accountsResponse.ok) {
      throw new Error(`Failed to fetch accounts: ${accountsResponse.statusText}`)
    }

    const accountsData = await accountsResponse.json()

    // Check if an account for this provider already exists
    const existingAccount =
      accountsData.items && Array.isArray(accountsData.items)
        ? accountsData.items.find((account: any) => account.type === provider)
        : null

    let accountId

    if (existingAccount) {
      accountId = existingAccount.id
    } else {
      // Create a new account for this provider
      const createResponse = await fetch(`${API_BASE_URL}/accounts`, {
        method: "POST",
        headers: {
          "X-API-KEY": API_KEY || "",
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          type: provider,
        }),
      })

      if (!createResponse.ok) {
        throw new Error(`Failed to create account: ${createResponse.statusText}`)
      }

      const newAccount = await createResponse.json()
      accountId = newAccount.id
    }

    // Now initiate the connection process
    const connectResponse = await fetch(`${API_BASE_URL}/accounts/${accountId}/connect`, {
      method: "POST",
      headers: {
        "X-API-KEY": API_KEY || "",
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })

    if (!connectResponse.ok) {
      throw new Error(`Failed to initiate connection: ${connectResponse.statusText}`)
    }

    const connectData = await connectResponse.json()

    return NextResponse.json({
      success: true,
      data: connectData,
    })
  } catch (error) {
    console.error("Error connecting account:", error)
    return NextResponse.json({ error: "Failed to connect account" }, { status: 500 })
  }
}

