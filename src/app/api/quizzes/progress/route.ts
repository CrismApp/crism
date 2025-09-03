import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { connectToDb } from "@/lib/db"
import { QuizCompletion } from "@/lib/model"
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

    await connectToDb()

    const completions = await QuizCompletion.find({ user: session.user.id })
      .populate('quiz', 'title')
      .sort({ completedAt: -1 })

    const completedQuizIds = completions.map(completion => completion.quiz._id.toString())

    return NextResponse.json({
      completions,
      completedQuizIds
    })

  } catch (error) {
    console.error("Error fetching user quiz progress:", error)
    return NextResponse.json(
      { error: "Failed to fetch quiz progress" },
      { status: 500 }
    )
  }
}
