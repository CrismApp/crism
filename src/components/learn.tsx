"use client"

import { useState, useEffect } from "react"
import { useSession } from "@/lib/auth-client"
import { useUser } from "@/context/UserContext"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Progress } from "./ui/progress"
import { BookOpen, Play, Clock, Star, CheckCircle, Trophy, ArrowLeft, ArrowRight, RotateCcw, Award, Coins, AlertCircle } from "lucide-react"

interface Quiz {
  _id: string
  title: string
  description: string
  image?: string
  questions: Question[]
  totalPoints: number
  isActive: boolean
  createdAt: string
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
  goldEarned: number
}

interface CompletionResult {
  totalPointsEarned: number
  scorePercentage: string
  goldAwarded: number
  answers: Array<{
    questionIndex: number
    selectedAnswer: number
    isCorrect: boolean
    pointsEarned: number
  }>
}

export default function Learn() {
  const { data: session } = useSession()
  const { refreshUser } = useUser()
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null)
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestionIndex: 0,
    selectedAnswers: [],
    showResults: false,
    score: 0,
    totalPossibleScore: 0,
    goldEarned: 0,
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [completedQuizIds, setCompletedQuizIds] = useState<string[]>([])
  const [completionResult, setCompletionResult] = useState<CompletionResult | null>(null)
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())

  // Helper function to check if URL is a valid image URL
  const isValidImageUrl = (url: string): boolean => {
    if (!url) return false
    try {
      const urlObj = new URL(url)
      // Check if it's a direct image URL (ends with image extension)
      const pathname = urlObj.pathname.toLowerCase()
      return pathname.endsWith('.jpg') || 
             pathname.endsWith('.jpeg') || 
             pathname.endsWith('.png') || 
             pathname.endsWith('.gif') || 
             pathname.endsWith('.webp') ||
             // Allow imgur and other image hosting services
             urlObj.hostname.includes('imgur.com') ||
             urlObj.hostname.includes('i.ibb.co') ||
             urlObj.hostname.includes('imagehosting')
    } catch {
      return false
    }
  }

  const handleImageError = (quizId: string) => {
    setImageErrors(prev => new Set([...prev, quizId]))
  }

  useEffect(() => {
    fetchQuizzes()
    fetchUserProgress()
  }, [])

  const fetchQuizzes = async () => {
    try {
      const response = await fetch("/api/quizzes")
      if (response.ok) {
        const data = await response.json()
        // Ensure data is an array
        if (Array.isArray(data)) {
          setQuizzes(data)
        } else {
          console.error("Expected quizzes to be an array, got:", typeof data)
          setQuizzes([])
        }
      } else {
        console.error("Failed to fetch quizzes:", response.status)
        setQuizzes([])
      }
    } catch (error) {
      console.error("Error fetching quizzes:", error)
      setQuizzes([])
    } finally {
      setLoading(false)
    }
  }

  const fetchUserProgress = async () => {
    try {
      const response = await fetch("/api/quizzes/progress")
      if (response.ok) {
        const data = await response.json()
        setCompletedQuizIds(data.completedQuizIds || [])
      }
    } catch (error) {
      console.error("Error fetching user progress:", error)
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
      goldEarned: 0,
    })
    setCompletionResult(null)
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
      const response = await fetch("/api/quizzes/complete", {
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
        const result = await response.json()
        setCompletionResult(result.completion)
        setQuizState((prev) => ({
          ...prev,
          showResults: true,
          score: totalScore,
          goldEarned: result.completion.goldAwarded,
        }))
        // Update completed quizzes
        setCompletedQuizIds(prev => [...prev, selectedQuiz._id])
        
        // Refresh user data to update gold in sidebar and profile
        console.log('🎯 Quiz completed, refreshing user data...')
        await refreshUser()
        console.log('✅ User data refresh completed')
      } else {
        const errorData = await response.json()
        console.error("Error submitting quiz:", errorData.error)
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
      goldEarned: 0,
    })
    setCompletionResult(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-orange-500">Loading quizzes...</p>
        </div>
      </div>
    )
  }

  // Quiz Interface
  if (selectedQuiz) {
    const currentQuestion = selectedQuiz.questions[quizState.currentQuestionIndex]
    const selectedAnswer = quizState.selectedAnswers[quizState.currentQuestionIndex]
    const progress = ((quizState.currentQuestionIndex + 1) / selectedQuiz.questions.length) * 100

    if (quizState.showResults) {
      const scorePercentage = completionResult?.scorePercentage || "0"
      
      return (
        <div className="min-h-screen bg-black p-4">
          <div className="max-w-2xl mx-auto">
            <Card className="shadow-xl border-orange-500/20">
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
                    <Trophy className="w-12 h-12 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2">{selectedQuiz.title}</h2>
                  <p className="text-lg text-gray-400">Quiz Complete!</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                    <div className="text-2xl font-bold text-orange-400">{scorePercentage}%</div>
                    <div className="text-sm text-gray-400">Score</div>
                  </div>
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-400">{quizState.score}</div>
                    <div className="text-sm text-gray-400">Points Earned</div>
                  </div>
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                    <div className="text-2xl font-bold text-yellow-400 flex items-center justify-center gap-1">
                      <Coins className="w-6 h-6" />
                      {quizState.goldEarned}
                    </div>
                    <div className="text-sm text-gray-400">Gold Earned</div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-white mb-4">🎉 Congratulations! 🎉</h3>
                    <p className="text-lg text-gray-300 mb-2">
                      You just earned <span className="text-yellow-400 font-bold">{quizState.goldEarned} Gold</span>!
                    </p>
                    <p className="text-base text-gray-400">
                      Great job completing the quiz. Keep learning to earn more rewards!
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 justify-center mt-8">
                  <Button onClick={resetQuiz} variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Quizzes
                  </Button>
                 
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    }

    return (
      <div className="min-h-screen bg-black p-4">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-xl border-orange-500/20">
            <CardHeader className="pb-4 border-b border-orange-500/20">
              <div className="flex items-center justify-between">
                <Button onClick={resetQuiz} variant="ghost" size="sm" className="text-gray-400 hover:text-orange-500 hover:bg-orange-500/10">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Badge variant="secondary" className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                  Question {quizState.currentQuestionIndex + 1} of {selectedQuiz.questions.length}
                </Badge>
              </div>
              <div className="mt-4">
                <Progress value={progress} className="h-2" />
                <div className="flex justify-between text-sm text-gray-400 mt-1">
                  <span>{selectedQuiz.title}</span>
                  <span>{Math.round(progress)}% complete</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-6 pt-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-white mb-4">
                  {currentQuestion.question}
                </h2>

                <div className="space-y-3">
                  {currentQuestion.answers.map((answer, index) => (
                    <button
                      key={index}
                      onClick={() => selectAnswer(index)}
                      className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                        selectedAnswer === index
                          ? "border-orange-500 bg-orange-500/10 text-orange-300"
                          : "border-gray-700 hover:border-orange-500/50 0 text-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          selectedAnswer === index
                            ? "border-orange-500 bg-orange-500"
                            : "border-gray-600"
                        }`}>
                          {selectedAnswer === index && (
                            <div className="w-3 h-3 bg-white rounded-full"></div>
                          )}
                        </div>
                        <span className="font-medium text-orange-400">{String.fromCharCode(65 + index)}.</span>
                        <span>{answer.text}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between">
                <Button
                  onClick={previousQuestion}
                  disabled={quizState.currentQuestionIndex === 0}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-800 disabled:opacity-50"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>

                <Button
                  onClick={quizState.currentQuestionIndex < selectedQuiz.questions.length - 1 ? nextQuestion : finishQuiz}
                  disabled={selectedAnswer === -1 || submitting}
                  className="bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      Submitting...
                    </>
                  ) : quizState.currentQuestionIndex < selectedQuiz.questions.length - 1 ? (
                    <>
                      Next
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Finish Quiz
                      <CheckCircle className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Quiz Grid
  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Learn & Earn</h1>
          <p className="text-lg text-gray-400">Complete quizzes to earn points and unlock rewards</p>
        </div>

        {!Array.isArray(quizzes) || quizzes.length === 0 ? (
          <Card className="text-center py-12 border-orange-500/20">
            <CardContent>
              <BookOpen className="mx-auto h-20 w-20 text-gray-600 mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">No Quizzes Available</h2>
              <p className="text-gray-400 mb-6">Check back later for new learning content.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.isArray(quizzes) && quizzes.map((quiz) => {
              const isCompleted = completedQuizIds.includes(quiz._id)
              
              return (
                <Card key={quiz._id} className="overflow-hidden hover:shadow-lg transition-all sborder-orange-500/20 hover:border-orange-500/40">
                  {quiz.image && isValidImageUrl(quiz.image) && !imageErrors.has(quiz._id) ? (
                    <div className="w-full h-48 overflow-hidden relative">
                      <Image
                        src={quiz.image}
                        alt={quiz.title}
                        fill
                        className="object-cover"
                        onError={() => handleImageError(quiz._id)}
                        onLoadingComplete={() => {
                          // Remove from error set if image loads successfully
                          setImageErrors(prev => {
                            const newSet = new Set(prev)
                            newSet.delete(quiz._id)
                            return newSet
                          })
                        }}
                      />
                    </div>
                  ) : quiz.image && !isValidImageUrl(quiz.image) ? (
                    <div className="w-full h-48 overflow-hidden relative flex items-center justify-center">
                      <div className="text-center text-gray-400">
                        <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-sm">Invalid image URL</p>
                      </div>
                    </div>
                  ) : null}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <CardTitle className="text-xl font-semibold text-white flex-1 pr-2 overflow-hidden">
                        <div className="line-clamp-2" style={{ 
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {quiz.title}
                        </div>
                      </CardTitle>
                      {isCompleted && (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30 ml-2 flex-shrink-0">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Completed
                        </Badge>
                      )}
                    </div>
                    
                    <div className="text-gray-400 mb-4 overflow-hidden" style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {quiz.description}
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="mr-1 h-4 w-4" />
                        {quiz.questions.length} questions
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Star className="mr-1 h-4 w-4" />
                        {quiz.totalPoints} points
                      </div>
                    </div>

                    <Button 
                      onClick={() => startQuiz(quiz)} 
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50"
                      disabled={isCompleted}
                    >
                      {isCompleted ? (
                        <>
                          <Award className="mr-2 h-4 w-4" />
                          Completed
                        </>
                      ) : (
                        <>
                          <Play className="mr-2 h-4 w-4" />
                          Start Quiz
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              )
            }) || null}
          </div>
        )}
      </div>
    </div>
  )
}
