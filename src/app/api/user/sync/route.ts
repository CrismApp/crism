import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { connectToDb } from "@/lib/db"
import { User } from "@/lib/model"
import { headers } from "next/headers"

export async function POST() {
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

    console.log('🔄 Syncing user data for:', session.user.email, 'ID:', session.user.id)

    await connectToDb()

    // Check if user exists
    let user = await User.findOne({ id: session.user.id })

    if (!user) {
      console.log('📝 Creating new user document for:', session.user.id)
      
      // Create new user document
      user = new User({
        id: session.user.id,
        email: session.user.email,
        name: session.user.name || session.user.email,
        image: session.user.image || null,
        emailVerified: session.user.emailVerified || false,
        goldAccumulated: 0,
        rank: 'Bronze',
        totalPoints: 0,
        walletAddress: null,
        lastLoginAt: new Date(),
        portfolioValue: 0,
        transactionCount: 0,
        completedQuizzes: [],
        rewards: [],
        createdAt: new Date(),
        updatedAt: new Date()
      })

      await user.save()
      console.log('✅ User document created successfully')
    } else {
      console.log('✅ User document already exists')
      
      // Update user with any missing session data
      const updates: any = {
        updatedAt: new Date()
      }
      
      if (session.user.name && user.name !== session.user.name) {
        updates.name = session.user.name
      }
      
      if (session.user.image && user.image !== session.user.image) {
        updates.image = session.user.image
      }
      
      if (Object.keys(updates).length > 1) { // More than just updatedAt
        await User.findOneAndUpdate({ id: session.user.id }, updates)
        user = await User.findOne({ id: session.user.id })
        console.log('✅ User document updated with session data')
      }
    }

    return NextResponse.json({
      success: true,
      user: {
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
      }
    })

  } catch (error) {
    console.error("Error syncing user data:", error)
    return NextResponse.json(
      { error: "Failed to sync user data" },
      { status: 500 }
    )
  }
}
