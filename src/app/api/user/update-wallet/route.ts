import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { User } from "@/lib/model"
import { headers } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { walletAddress } = await request.json()

    if (!walletAddress || typeof walletAddress !== 'string') {
      return NextResponse.json(
        { error: "Invalid wallet address" },
        { status: 400 }
      )
    }

    // Update user's wallet address using Mongoose
    const updatedUser = await User.findOneAndUpdate(
      { id: session.user.id },
      { 
        walletAddress,
        updatedAt: new Date()
      },
      { new: true }
    )

    if (!updatedUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      user: updatedUser 
    })

  } catch (error) {
    console.error("Error updating wallet address:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
