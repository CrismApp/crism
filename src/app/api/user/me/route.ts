import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { connectToDb } from "@/lib/db"
import { User } from "@/lib/model"
import { headers } from "next/headers"

export async function GET() {
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

    console.log('👤 Fetching user data for:', session.user.email, 'ID:', session.user.id)

    await connectToDb()

    // Fetch the most up-to-date user data from the database
    const user = await User.findOne({ id: session.user.id })

    if (!user) {
      console.log('❌ User not found in database:', session.user.id)
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    console.log('✅ Found user with gold:', user.goldAccumulated)

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      rank: user.rank,
      goldAccumulated: user.goldAccumulated,
      totalPoints: user.totalPoints,
      walletAddress: user.walletAddress,
      portfolioValue: user.portfolioValue,
      transactionCount: user.transactionCount,
      completedQuizzes: user.completedQuizzes,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    })

  } catch (error) {
    console.error("Error fetching user data:", error)
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 }
    )
  }
}
