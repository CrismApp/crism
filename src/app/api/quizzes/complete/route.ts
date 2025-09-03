import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { connectToDb } from "@/lib/db"
import { Quiz, QuizCompletion, User, Reward } from "@/lib/model"
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

    await connectToDb()

    const { quizId, answers, totalPointsEarned } = await request.json()

    // Validate inputs
    if (!quizId || !answers || typeof totalPointsEarned !== 'number') {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Check if quiz exists
    const quiz = await Quiz.findById(quizId)
    if (!quiz) {
      return NextResponse.json(
        { error: "Quiz not found" },
        { status: 404 }
      )
    }

    // Check if user already completed this quiz
    const existingCompletion = await QuizCompletion.findOne({
      user: session.user.id,
      quiz: quizId
    })

    if (existingCompletion) {
      return NextResponse.json(
        { error: "Quiz already completed" },
        { status: 400 }
      )
    }

    // Calculate gold based on score percentage
    const scorePercentage = (totalPointsEarned / quiz.totalPoints) * 100
    let goldAwarded = 0
    
    if (scorePercentage >= 90) {
      goldAwarded = 50 // Excellent
    } else if (scorePercentage >= 80) {
      goldAwarded = 40 // Good
    } else if (scorePercentage >= 70) {
      goldAwarded = 30 // Pass
    } else if (scorePercentage >= 60) {
      goldAwarded = 20 // Barely pass
    } else {
      goldAwarded = 10 // Participation
    }

    // Create quiz completion record
    const completion = new QuizCompletion({
      user: session.user.id,
      quiz: quizId,
      answers,
      totalPointsEarned,
      completedAt: new Date()
    })

    await completion.save()

    // Create reward record
    const reward = new Reward({
      user: session.user.id,
      type: 'quiz_completion',
      title: `Completed: ${quiz.title}`,
      description: `Scored ${scorePercentage.toFixed(1)}% (${totalPointsEarned}/${quiz.totalPoints} points)`,
      points: totalPointsEarned,
      goldAwarded,
      earnedAt: new Date()
    })

    await reward.save()

    console.log(`💰 Attempting to update user ${session.user.id} with ${goldAwarded} gold`)

    // First check if user exists
    const existingUser = await User.findOne({ id: session.user.id })
    if (!existingUser) {
      console.log(`❌ User not found in database: ${session.user.id}`)
      
      // Try to create the user first
      const newUser = new User({
        id: session.user.id,
        email: session.user.email,
        name: session.user.name || session.user.email,
        goldAccumulated: goldAwarded,
        totalPoints: totalPointsEarned,
        rank: 'Bronze',
        completedQuizzes: [quizId],
        rewards: [reward._id],
        createdAt: new Date(),
        updatedAt: new Date()
      })
      
      const savedUser = await newUser.save()
      console.log(`✅ Created new user with ${goldAwarded} gold`)
    } else {
      console.log(`👤 Found existing user with current gold: ${existingUser.goldAccumulated}`)
      
      // Calculate new gold total
      const newGoldTotal = (existingUser.goldAccumulated || 0) + goldAwarded
      console.log(`💰 Adding ${goldAwarded} gold. New total will be: ${newGoldTotal}`)
      
      // Update user's gold and total points
      const userUpdateResult = await User.findOneAndUpdate(
        { id: session.user.id },
        { 
          $set: {
            goldAccumulated: newGoldTotal,
            updatedAt: new Date()
          },
          $inc: { 
            totalPoints: totalPointsEarned 
          },
          $push: { 
            completedQuizzes: quizId,
            rewards: reward._id 
          }
        },
        { new: true } 
      )

      if (userUpdateResult) {
        console.log(`✅ User updated successfully. New gold total: ${userUpdateResult.goldAccumulated}`)
      } else {
        console.log(`❌ Failed to update user: ${session.user.id}`)
      }
    }

    return NextResponse.json({
      success: true,
      completion: {
        totalPointsEarned,
        scorePercentage: scorePercentage.toFixed(1),
        goldAwarded,
        answers
      }
    })

  } catch (error) {
    console.error("Error completing quiz:", error)
    return NextResponse.json(
      { error: "Failed to complete quiz" },
      { status: 500 }
    )
  }
}
