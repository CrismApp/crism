"use client"

import { useState } from "react"

export interface Question {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

export interface QuizCardData {
  id: string
  title: string
  content: string
  questions: Question[]
}

export function parseMarkdownToQuiz(markdown: string): QuizCardData | null {
  try {
    const lines = markdown.split("\n").filter((line) => line.trim() !== "")

    let title = ""
    let content = ""
    const questions: Question[] = []

    let currentSection = "metadata"
    let currentQuestion: Partial<Question> = {}
    let questionCounter = 1

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()

      // Parse title
      if (line.startsWith("# ")) {
        title = line.substring(2).trim()
        continue
      }

      // Parse content section
      if (line.startsWith("## Content")) {
        currentSection = "content"
        continue
      }

      // Parse questions section
      if (line.startsWith("## Questions")) {
        currentSection = "questions"
        continue
      }

      // Handle content
      if (currentSection === "content" && !line.startsWith("##")) {
        content += line + " "
        continue
      }

      // Handle questions
      if (currentSection === "questions") {
        if (line.startsWith("### ")) {
          // Save previous question if exists
          if (currentQuestion.question && currentQuestion.options && currentQuestion.options.length > 0) {
            questions.push({
              id: `q${questionCounter}`,
              question: currentQuestion.question,
              options: currentQuestion.options,
              correctAnswer: currentQuestion.correctAnswer || 0,
              explanation: currentQuestion.explanation || "",
            })
            questionCounter++
          }

          // Start new question
          currentQuestion = {
            question: line.substring(4).trim(),
            options: [],
            correctAnswer: 0,
            explanation: "",
          }
        } else if (line.startsWith("- ")) {
          // Add option
          const option = line.substring(2).trim()
          if (option.startsWith("**") && option.endsWith("**")) {
            // This is the correct answer
            currentQuestion.correctAnswer = currentQuestion.options?.length || 0
            currentQuestion.options?.push(option.replace(/\*\*/g, ""))
          } else {
            currentQuestion.options?.push(option)
          }
        } else if (line.startsWith("*Explanation:")) {
          currentQuestion.explanation = line.substring(13).trim()
        }
      }
    }

    // Add the last question
    if (currentQuestion.question && currentQuestion.options && currentQuestion.options.length > 0) {
      questions.push({
        id: `q${questionCounter}`,
        question: currentQuestion.question,
        options: currentQuestion.options,
        correctAnswer: currentQuestion.correctAnswer || 0,
        explanation: currentQuestion.explanation || "",
      })
    }

    // Validate the parsed data
    if (!title || !content || questions.length === 0) {
      throw new Error("Missing required sections: title, content, or questions")
    }

    // Validate each question has at least 2 options
    for (const question of questions) {
      if (question.options.length < 2) {
        throw new Error(`Question "${question.question}" must have at least 2 options`)
      }
    }

    return {
      id: title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
      title: title,
      content: content.trim(),
      questions: questions,
    }
  } catch (error) {
    console.error("Error parsing markdown:", error)
    return null
  }
}

// Convert QuizCardData to API format
export function convertToAPIFormat(quizData: QuizCardData) {
  return {
    title: quizData.title,
    description: quizData.content.substring(0, 200) + (quizData.content.length > 200 ? "..." : ""), // Short description
    content: quizData.content, // Full learning content
    questions: quizData.questions.map(q => ({
      question: q.question,
      answers: q.options.map((option, index) => ({
        text: option,
        isCorrect: index === q.correctAnswer
      })),
      points: 10 // Default points per question
    }))
  }
}

export function MarkdownQuizParser() {
  const [markdown, setMarkdown] = useState(`# Bitcoin Basics

## Content
Bitcoin is a decentralized digital currency that operates without a central bank or single administrator. It was invented in 2008 by an unknown person or group using the name Satoshi Nakamoto.

## Questions

### What year was Bitcoin invented?
- 2007
- **2008**
- 2009
- 2010
*Explanation: Bitcoin was invented in 2008 by Satoshi Nakamoto.

### Who created Bitcoin?
- Vitalik Buterin
- **Satoshi Nakamoto**
- Elon Musk
- Mark Zuckerberg
*Explanation: Bitcoin was created by the pseudonymous Satoshi Nakamoto.`)

  const [parsedQuiz, setParsedQuiz] = useState<QuizCardData | null>(null)
  const [apiFormat, setApiFormat] = useState<any>(null)
  const [isCreating, setIsCreating] = useState(false)

  const handleParse = () => {
    const result = parseMarkdownToQuiz(markdown)
    setParsedQuiz(result)
    if (result) {
      setApiFormat(convertToAPIFormat(result))
    }
  }

  const handleCreateQuiz = async () => {
    if (!apiFormat) return

    setIsCreating(true)
    try {
      const response = await fetch('/api/quizzes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiFormat)
      })

      if (response.ok) {
        const result = await response.json()
        alert('Quiz created successfully!')
        console.log('Created quiz:', result)
      } else {
        const error = await response.json()
        alert(`Error creating quiz: ${error.error}`)
      }
    } catch (error) {
      console.error('Error creating quiz:', error)
      alert('Failed to create quiz')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="space-y-6 bg-black text-white p-6">
      <div>
        <h3 className="text-lg font-semibold mb-2 text-white">Markdown Format Example:</h3>
        <div className="text-sm text-gray-400 mb-4">
          <p>Use this format to create quiz cards:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li><code className="text-orange-400"># Title</code> - Main card title</li>
            <li><code className="text-orange-400">## Content</code> - Learning content section</li>
            <li><code className="text-orange-400">## Questions</code> - Questions section</li>
            <li><code className="text-orange-400">### Question text</code> - Individual questions</li>
            <li><code className="text-orange-400">- Option text</code> - Answer options</li>
            <li><code className="text-orange-400">- **Correct answer**</code> - Mark correct with bold</li>
            <li><code className="text-orange-400">*Explanation: text</code> - Question explanation</li>
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-300">Markdown Input:</label>
          <textarea
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            className="w-full h-96 p-3 border rounded-md font-mono text-sm bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-orange-500"
            placeholder="Enter your markdown here..."
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleParse}
              className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
            >
              Parse Markdown
            </button>
            {apiFormat && (
              <button
                onClick={handleCreateQuiz}
                disabled={isCreating}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors disabled:opacity-50"
              >
                {isCreating ? 'Creating...' : 'Create Quiz'}
              </button>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-300">API Format:</label>
          <div className="h-96 p-3 border rounded-md bg-gray-800 border-gray-700 overflow-auto">
            {apiFormat ? (
              <pre className="text-sm whitespace-pre-wrap text-gray-300">{JSON.stringify(apiFormat, null, 2)}</pre>
            ) : (
              <p className="text-gray-400">Click &quot;Parse Markdown&quot; to see the API format</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
