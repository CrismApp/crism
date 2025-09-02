import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { User } from "@/lib/model"
import { headers } from "next/headers"

export async function PATCH(request: NextRequest) {
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

    const { goldAmount, rank } = await request.json()

    const updateData: Record<string, unknown> = {}
    
    if (typeof goldAmount === 'number') {
      updateData.goldAccumulated = (session.user.goldAccumulated || 0) + goldAmount
    }
    
    if (typeof rank === 'string') {
      updateData.rank = rank
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid update data provided" },
        { status: 400 }
      )
    }

    const updatedUser = await User.findOneAndUpdate(
      { id: session.user.id },
      updateData,
      { new: true }
    )

    return NextResponse.json({ 
      success: true, 
      user: updatedUser 
    })

  } catch (error) {
    console.error("Error updating user data:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}