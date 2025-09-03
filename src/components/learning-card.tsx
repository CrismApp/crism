"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface Question {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation?: string
}

interface LearningCardProps {
  title: string
  content: string
  questions: Question[]
  onComplete: (score: number) => void
  cardNumber: number
  totalCards: number
}

export function LearningCard({ title, content, questions, onComplete, cardNumber, totalCards }: LearningCardProps) {
  const [mode, setMode] = useState<"reading" | "quiz">("reading")
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([])
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)

  const handleNext = () => {
    setMode("quiz")
  }

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers]
    newAnswers[currentQuestionIndex] = answerIndex
    setSelectedAnswers(newAnswers)
  }

  const handleQuestionNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
    } else {
      // Calculate score
      const correctAnswers = selectedAnswers.reduce((acc, answer, index) => {
        return acc + (answer === questions[index].correctAnswer ? 1 : 0)
      }, 0)
      const finalScore = Math.round((correctAnswers / questions.length) * 100)
      setScore(finalScore)
      setShowResults(true)
    }
  }

  const handleComplete = () => {
    onComplete(score)
  }

  if (mode === "reading") {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between mb-2">
            <Badge variant="secondary" className="text-xs">
              Card {cardNumber} of {totalCards}
            </Badge>
            <Badge variant="outline" className="text-xs">
              Reading
            </Badge>
          </div>
          <CardTitle className="text-xl font-bold text-balance">{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto mb-6">
            <div className="prose prose-sm max-w-none">
              {content.split("\n\n").map((paragraph, index) => (
                <p key={index} className="mb-4 text-sm leading-relaxed text-foreground">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
          <Button onClick={handleNext} className="w-full" size="lg">
            Start Quiz
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (showResults) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between mb-2">
            <Badge variant="secondary" className="text-xs">
              Card {cardNumber} of {totalCards}
            </Badge>
            <Badge variant="outline" className="text-xs">
              Results
            </Badge>
          </div>
          <CardTitle className="text-xl font-bold text-balance">Quiz Complete!</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col items-center justify-center text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="mb-6"
          >
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Star className="w-12 h-12 text-primary" />
              </div>
              <Badge
                className="absolute -top-2 -right-2 text-lg font-bold px-3 py-1"
                variant={score >= 80 ? "default" : score >= 60 ? "secondary" : "destructive"}
              >
                {score}%
              </Badge>
            </div>
          </motion.div>

          <h3 className="text-lg font-semibold mb-2">
            {score >= 80 ? "Excellent!" : score >= 60 ? "Good Job!" : "Keep Learning!"}
          </h3>
          <p className="text-muted-foreground mb-6">
            You scored {score}% on this topic.
            {score >= 80
              ? " Outstanding work!"
              : score >= 60
                ? " You're on the right track!"
                : " Review the material and try again."}
          </p>

          <Button onClick={handleComplete} className="w-full" size="lg">
            Continue Learning
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const hasAnswered = selectedAnswers[currentQuestionIndex] !== undefined

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="secondary" className="text-xs">
            Question {currentQuestionIndex + 1} of {questions.length}
          </Badge>
          <Badge variant="outline" className="text-xs">
            Quiz
          </Badge>
        </div>
        <CardTitle className="text-lg font-bold text-balance">{currentQuestion.question}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="flex-1 space-y-3 mb-6">
          {currentQuestion.options.map((option, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleAnswerSelect(index)}
              className={cn(
                "w-full p-4 text-left rounded-lg border-2 transition-all",
                "hover:border-primary/50",
                selectedAnswers[currentQuestionIndex] === index
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card",
              )}
            >
              <div className="flex items-center">
                <div
                  className={cn(
                    "w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center",
                    selectedAnswers[currentQuestionIndex] === index
                      ? "border-primary bg-primary"
                      : "border-muted-foreground",
                  )}
                >
                  {selectedAnswers[currentQuestionIndex] === index && (
                    <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                  )}
                </div>
                <span className="text-sm">{option}</span>
              </div>
            </motion.button>
          ))}
        </div>

        <Button onClick={handleQuestionNext} disabled={!hasAnswered} className="w-full" size="lg">
          {currentQuestionIndex < questions.length - 1 ? "Next Question" : "Finish Quiz"}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  )
}
