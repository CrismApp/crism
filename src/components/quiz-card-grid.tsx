"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, RotateCcw } from "lucide-react"

interface Question {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

interface QuizCardData {
  id: string
  title: string
  content: string
  questions: Question[]
}

const learningData: QuizCardData[] = [
  {
    id: "intro",
    title: "Introduction to Crest",
    content: `Crest is a cryptocurrency trading platform focused primarily on Bitcoin transactions. The platform emphasizes user control, time efficiency, and maximizing Bitcoin holdings ("keeping more sats").`,
    questions: [
      {
        id: "q1",
        question: "What is Crest's primary focus?",
        options: [
          "All cryptocurrency trading",
          "Bitcoin transactions specifically",
          "Stock market trading",
          "Forex trading",
        ],
        correctAnswer: 1,
        explanation: "Crest is focused primarily on Bitcoin transactions.",
      },
      {
        id: "q2",
        question: "What does 'keeping more sats' refer to?",
        options: [
          "Saving money on fees",
          "Maximizing Bitcoin holdings",
          "Trading more frequently",
          "Using satellite internet",
        ],
        correctAnswer: 1,
        explanation:
          "Sats (Satoshis) are the smallest unit of Bitcoin, so keeping more sats means maximizing Bitcoin holdings.",
      },
    ],
  },
  {
    id: "features",
    title: "Key Features",
    content: `Crest offers Bitcoin trading with enhanced user control, time efficiency, and features designed to help users maximize their Bitcoin holdings through streamlined processes.`,
    questions: [
      {
        id: "q3",
        question: "What is the first step to get started with Crest?",
        options: [
          "Download the mobile app",
          "Visit https://crestapp.xyz/",
          "Call customer support",
          "Complete identity verification",
        ],
        correctAnswer: 1,
        explanation: "The first step is to visit the Crest website at https://crestapp.xyz/",
      },
    ],
  },
  {
    id: "security",
    title: "Security Features",
    content: `Crest uses cold storage solutions, multi-signature wallets, two-factor authentication, and regular security audits to protect user funds and accounts.`,
    questions: [
      {
        id: "q4",
        question: "What storage solution does Crest use for enhanced security?",
        options: ["Hot wallets only", "Cold storage solutions", "Browser storage", "Cloud storage"],
        correctAnswer: 1,
        explanation: "Crest uses cold storage solutions to securely store funds offline.",
      },
    ],
  },
]

interface QuizCardProps {
  data: QuizCardData
  isFlipped: boolean
  onFlip: () => void
  onComplete: (score: number) => void
}

function QuizCard({ data, isFlipped, onFlip, onComplete }: QuizCardProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([])
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers]
    newAnswers[currentQuestionIndex] = answerIndex
    setSelectedAnswers(newAnswers)
  }

  const handleNext = () => {
    if (currentQuestionIndex < data.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
    } else {
      // Calculate score
      const correctAnswers = selectedAnswers.reduce((acc, answer, index) => {
        return acc + (answer === data.questions[index].correctAnswer ? 1 : 0)
      }, 0)
      const finalScore = Math.round((correctAnswers / data.questions.length) * 100)
      setScore(finalScore)
      setShowResults(true)
    }
  }

  const handleComplete = () => {
    onComplete(score)
    // Reset for next time
    setCurrentQuestionIndex(0)
    setSelectedAnswers([])
    setShowResults(false)
    setScore(0)
  }

  const currentQuestion = data.questions[currentQuestionIndex]
  const selectedAnswer = selectedAnswers[currentQuestionIndex]

  return (
    <div className="relative w-full h-80 perspective-1000">
      <motion.div
        className="relative w-full h-full preserve-3d cursor-pointer"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        onClick={!isFlipped ? onFlip : undefined}
      >
        {/* Front Side - Content */}
        <Card className="absolute inset-0 backface-hidden border-2 hover:border-primary/50 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-center">{data.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">{data.content}</p>
            <div className="mt-4 text-center">
              <Badge variant="outline" className="text-xs">
                Click to start quiz
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Back Side - Quiz */}
        <Card className="absolute inset-0 backface-hidden rotate-y-180 border-2 border-primary/20">
          <CardContent className="p-4 h-full flex flex-col">
            {!showResults ? (
              <>
                <div className="flex justify-between items-center mb-4">
                  <Badge variant="secondary">
                    Question {currentQuestionIndex + 1} of {data.questions.length}
                  </Badge>
                </div>

                <div className="flex-1">
                  <h3 className="font-medium mb-4 text-sm leading-relaxed">{currentQuestion.question}</h3>

                  <div className="space-y-2">
                    {currentQuestion.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleAnswerSelect(index)}
                        className={`w-full p-2 text-left text-xs rounded-md border transition-colors ${
                          selectedAnswer === index
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                <Button onClick={handleNext} disabled={selectedAnswer === undefined} className="w-full mt-4" size="sm">
                  {currentQuestionIndex < data.questions.length - 1 ? "Next Question" : "Finish Quiz"}
                </Button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="mb-4">
                  {score >= 70 ? (
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                  ) : (
                    <XCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
                  )}
                  <h3 className="font-semibold text-lg">Quiz Complete!</h3>
                  <p className="text-2xl font-bold text-primary mt-2">{score}%</p>
                  <p className="text-xs text-muted-foreground mt-1">{score >= 70 ? "Great job!" : "Keep learning!"}</p>
                </div>

                <Button onClick={handleComplete} className="w-full" size="sm">
                  Continue Learning
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export function QuizCardGrid() {
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set())
  const [completedCards, setCompletedCards] = useState<Set<string>>(new Set())
  const [totalPoints, setTotalPoints] = useState(0)

  const handleCardFlip = (cardId: string) => {
    setFlippedCards((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(cardId)) {
        newSet.delete(cardId)
      } else {
        newSet.add(cardId)
      }
      return newSet
    })
  }

  const handleCardComplete = (cardId: string, score: number) => {
    setCompletedCards((prev) => new Set([...prev, cardId]))
    setTotalPoints((prev) => prev + score)
    setFlippedCards((prev) => {
      const newSet = new Set(prev)
      newSet.delete(cardId)
      return newSet
    })
  }

  const handleReset = () => {
    setFlippedCards(new Set())
    setCompletedCards(new Set())
    setTotalPoints(0)
  }

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Crypto Learning Cards</h1>
            <p className="text-muted-foreground">Click any card to start the quiz</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-lg font-semibold">{totalPoints} Points</div>
              <div className="text-sm text-muted-foreground">
                {completedCards.size}/{learningData.length} Completed
              </div>
            </div>
            <Button onClick={handleReset} variant="outline" size="sm">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {learningData.map((card) => (
            <div key={card.id} className="relative">
              {completedCards.has(card.id) && (
                <div className="absolute -top-2 -right-2 z-10">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}
              <QuizCard
                data={card}
                isFlipped={flippedCards.has(card.id)}
                onFlip={() => handleCardFlip(card.id)}
                onComplete={(score) => handleCardComplete(card.id, score)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
