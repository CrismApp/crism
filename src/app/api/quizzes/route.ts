import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { connectToDb } from "@/lib/db"
import { Quiz } from "@/lib/model"
import { headers } from "next/headers"

export async function GET() {
  try {
    await connectToDb()
    
    // Fetch all active quizzes, sorted by creation date (newest first)
    const quizzes = await Quiz.find({ isActive: true })
      .select('title description image totalPoints questions createdAt')
      .sort({ createdAt: -1 })
    
    return NextResponse.json(quizzes)
  } catch (error) {
    console.error("Error fetching quizzes:", error)
    return NextResponse.json(
      { error: "Failed to fetch quizzes" },
      { status: 500 }
    )
  }
}

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

    const body = await request.json()
    const { title, description, image, questions } = body

    // Validate required fields
    if (!title || !description || !questions || !Array.isArray(questions)) {
      return NextResponse.json(
        { error: "Missing required fields: title, description, and questions" },
        { status: 400 }
      )
    }

    // Validate questions structure
    for (const question of questions) {
      if (!question.question || !question.answers || !Array.isArray(question.answers) || question.answers.length < 2) {
        return NextResponse.json(
          { error: "Each question must have a question text and at least 2 answers" },
          { status: 400 }
        )
      }

      // Check if at least one answer is marked as correct
      const hasCorrectAnswer = question.answers.some((answer: any) => answer.isCorrect === true)
      if (!hasCorrectAnswer) {
        return NextResponse.json(
          { error: "Each question must have at least one correct answer" },
          { status: 400 }
        )
      }
    }

    // Calculate total points
    const totalPoints = questions.reduce((sum: number, q: any) => sum + (q.points || 10), 0)

    // Create the quiz
    const quiz = new Quiz({
      title,
      description,
      image,
      questions: questions.map((q: any) => ({
        question: q.question,
        answers: q.answers.map((a: any) => ({
          text: a.text,
          isCorrect: a.isCorrect
        })),
        points: q.points || 10
      })),
      totalPoints,
      createdBy: session.user.id,
      createdAt: new Date(),
      isActive: true
    })

    const savedQuiz = await quiz.save()

    console.log(`✅ Quiz created successfully: ${title} (${savedQuiz._id})`)

    return NextResponse.json({
      success: true,
      quiz: {
        id: savedQuiz._id,
        title: savedQuiz.title,
        description: savedQuiz.description,
        image: savedQuiz.image,
        questions: savedQuiz.questions,
        totalPoints: savedQuiz.totalPoints,
        createdAt: savedQuiz.createdAt
      }
    })

  } catch (error) {
    console.error("Error creating quiz:", error)
    return NextResponse.json(
      { error: "Failed to create quiz" },
      { status: 500 }
    )
  }
}
