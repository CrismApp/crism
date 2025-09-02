"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card } from "./ui/card"
import { Button } from "./ui/button"
import { BookOpen, Play, Clock, Star, CheckCircle, Trophy } from "lucide-react"

interface Quiz {
  _id: string
  title: string
  description: string
  image?: string
  questions: Question[]
  totalPoints: number
  isActive: boolean
}

interface Question {
  question: string
  answers: Answer[]
  points: number
}

interface Answer {
  text: string
  isCorrect: boolean
}

interface QuizState {
  currentQuestionIndex: number
  selectedAnswers: number[]
  showResults: boolean
  score: number
  totalPossibleScore: number
}

export default function Learn() {
  const { data: session } = useSession()
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null)
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestionIndex: 0,
    selectedAnswers: [],
    showResults: false,
    score: 0,
    totalPossibleScore: 0,
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchQuizzes()
  }, [])

  const fetchQuizzes = async () => {
    try {
      const response = await fetch("/api/quizzes")
      if (response.ok) {
        const data = await response.json()
        setQuizzes(data)
      }
    } catch (error) {
      console.error("Error fetching quizzes:", error)
    } finally {
      setLoading(false)
    }
  }

  const startQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz)
    setQuizState({
      currentQuestionIndex: 0,
      selectedAnswers: new Array(quiz.questions.length).fill(-1),
      showResults: false,
      score: 0,
      totalPossibleScore: quiz.totalPoints,
    })
  }

  const selectAnswer = (answerIndex: number) => {
    const newSelectedAnswers = [...quizState.selectedAnswers]
    newSelectedAnswers[quizState.currentQuestionIndex] = answerIndex
    setQuizState((prev) => ({
      ...prev,
      selectedAnswers: newSelectedAnswers,
    }))
  }

  const nextQuestion = () => {
    if (selectedQuiz && quizState.currentQuestionIndex < selectedQuiz.questions.length - 1) {
      setQuizState((prev) => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
      }))
    } else {
      finishQuiz()
    }
  }

  const previousQuestion = () => {
    if (quizState.currentQuestionIndex > 0) {
      setQuizState((prev) => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex - 1,
      }))
    }
  }

  const finishQuiz = async () => {
    if (!selectedQuiz || !session) return

    setSubmitting(true)

    // Calculate score
    let totalScore = 0
    const answers = quizState.selectedAnswers.map((selectedAnswer, questionIndex) => {
      const question = selectedQuiz.questions[questionIndex]
      const isCorrect = selectedAnswer !== -1 && question.answers[selectedAnswer]?.isCorrect
      const pointsEarned = isCorrect ? question.points : 0
      totalScore += pointsEarned

      return {
        questionIndex,
        selectedAnswer,
        isCorrect,
        pointsEarned,
      }
    })

    try {
      // Submit quiz completion
      const response = await fetch("/api/quiz/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quizId: selectedQuiz._id,
          answers,
          totalPointsEarned: totalScore,
        }),
      })

      if (response.ok) {
        setQuizState((prev) => ({
          ...prev,
          showResults: true,
          score: totalScore,
        }))
      }
    } catch (error) {
      console.error("Error submitting quiz:", error)
    } finally {
      setSubmitting(false)
    }
  }

  const resetQuiz = () => {
    setSelectedQuiz(null)
    setQuizState({
      currentQuestionIndex: 0,
      selectedAnswers: [],
      showResults: false,
      score: 0,
      totalPossibleScore: 0,
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Coming Soon Overlay
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 relative">
      {/* Blurred background content */}
      <div className="blur-sm pointer-events-none opacity-50">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Learn & Earn</h1>
            <p className="text-lg text-gray-600">Complete quizzes to earn points and unlock rewards</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Mock quiz cards */}
            {[1, 2, 3, 4, 5, 6].map((index) => (
              <Card key={index} className="overflow-hidden">
                <div className="w-full h-48 bg-gray-200"></div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Sample Quiz {index}</h3>
                  <p className="text-gray-600 mb-4">Learn about various topics and earn points</p>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="mr-1 h-4 w-4" />
                      10 questions
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Star className="mr-1 h-4 w-4" />
                      100 points
                    </div>
                  </div>

                  <Button className="w-full" disabled>
                    <Play className="mr-2 h-4 w-4" />
                    Start Quiz
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Coming Soon Overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
        <Card className="p-12 text-center max-w-md mx-4 shadow-2xl">
          <div className="mb-6">
            <BookOpen className="mx-auto h-20 w-20 text-blue-600 mb-4" />
            <h2 className="text-4xl font-bold text-gray-900 mb-2">Coming Soon</h2>
            <p className="text-lg text-gray-600 mb-6">
              Our interactive quiz platform is launching soon! Get ready to learn and earn points.
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-center text-gray-700">
              <Trophy className="mr-2 h-5 w-5 text-yellow-500" />
              <span>Earn points and rewards</span>
            </div>
            <div className="flex items-center justify-center text-gray-700">
              <Star className="mr-2 h-5 w-5 text-blue-500" />
              <span>Track your progress</span>
            </div>
            <div className="flex items-center justify-center text-gray-700">
              <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
              <span>Interactive learning experience</span>
            </div>
          </div>

          <Button className="w-full" disabled>
            Notify Me When Ready
          </Button>

          <p className="text-sm text-gray-500 mt-4">Expected launch: Q2 2024</p>
        </Card>
      </div>
    </div>
  )
}
