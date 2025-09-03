"use client"

import { useState } from "react"
import { useSession } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Upload, FileText, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react"
import { parseMarkdownToQuiz, type QuizCardData } from "@/components/markdown-quiz-parser"

export default function AdminPage() {
  const { data: session, isPending } = useSession()
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [image, setImage] = useState("")
  const [markdown, setMarkdown] = useState(`# Introduction to Bitcoin

## Content
Bitcoin is a decentralized digital currency that operates without a central bank or single administrator. It was invented in 2008 by an unknown person or group using the name Satoshi Nakamoto and started in 2009 when its implementation was released as open-source software.

## Questions

### What year was Bitcoin invented?
- 2007
- **2008**
- 2009
- 2010
*Explanation: Bitcoin was invented in 2008 by Satoshi Nakamoto, though the network launched in 2009.

### Who created Bitcoin?
- Vitalik Buterin
- **Satoshi Nakamoto**
- Elon Musk
- Mark Zuckerberg
*Explanation: Bitcoin was created by the pseudonymous Satoshi Nakamoto.

### What type of currency is Bitcoin?
- Centralized digital currency
- **Decentralized digital currency**
- Physical currency
- Government-issued currency
*Explanation: Bitcoin is a decentralized digital currency that operates without a central authority.`)

  const [parsedQuiz, setParsedQuiz] = useState<QuizCardData | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  // Check if user is admin
  const isAdmin = session?.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
                 session?.user?.id === process.env.NEXT_PUBLIC_ADMIN_USER_ID

  if (isPending) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-orange-500">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session?.user) {
    router.push("/")
    return null
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Card className="max-w-md w-full mx-4 bg-gray-900 border-orange-500/20">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2 text-white">Access Denied</h2>
            <p className="text-gray-400 mb-4">You don&apos;t have permission to access the admin panel.</p>
            <Button 
              onClick={() => router.push("/dashboard")} 
              variant="outline" 
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleParseMarkdown = () => {
    const result = parseMarkdownToQuiz(markdown)
    setParsedQuiz(result)
    if (!result) {
      setSubmitStatus({ type: 'error', message: 'Failed to parse markdown. Please check the format.' })
    } else {
      setSubmitStatus(null)
    }
  }

  const handleSubmit = async () => {
    if (!parsedQuiz) {
      setSubmitStatus({ type: 'error', message: 'Please parse the markdown first.' })
      return
    }

    if (!title || !description) {
      setSubmitStatus({ type: 'error', message: 'Please fill in title and description.' })
      return
    }

    setIsSubmitting(true)
    setSubmitStatus(null)

    try {
      const response = await fetch('/api/quizzes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          image: image || undefined,
          questions: parsedQuiz.questions.map(q => ({
            question: q.question,
            answers: q.options.map((option, index) => ({
              text: option,
              isCorrect: index === q.correctAnswer
            })),
            points: 10 // Default points per question
          }))
        })
      })

      if (response.ok) {
        setSubmitStatus({ type: 'success', message: 'Quiz created successfully!' })
        // Reset form
        setTitle("")
        setDescription("")
        setImage("")
        setMarkdown("")
        setParsedQuiz(null)
      } else {
        const errorData = await response.json()
        setSubmitStatus({ type: 'error', message: errorData.error || 'Failed to create quiz' })
      }
    } catch (error) {
      console.error('Error creating quiz:', error)
      setSubmitStatus({ type: 'error', message: 'An unexpected error occurred' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-white">Quiz Admin Panel</h1>
          <p className="text-gray-400">Create and manage learning quizzes</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quiz Details Form */}
          <Card className="bg-gray-900 border-orange-500/20">
            <CardHeader className="border-b border-orange-500/20">
              <CardTitle className="flex items-center gap-2 text-white">
                <FileText className="h-5 w-5 text-orange-400" />
                Quiz Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div>
                <Label htmlFor="title" className="text-gray-300">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter quiz title"
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-orange-500"
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-gray-300">Description *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter quiz description"
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-orange-500"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="image" className="text-gray-300">Image URL (optional)</Label>
                <Input
                  id="image"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-orange-500"
                />
              </div>

              {submitStatus && (
                <div className={`flex items-center gap-2 p-3 rounded-md ${
                  submitStatus.type === 'success' 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                  {submitStatus.type === 'success' ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  {submitStatus.message}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Markdown Input */}
          <Card className="bg-gray-900 border-orange-500/20">
            <CardHeader className="border-b border-orange-500/20">
              <CardTitle className="flex items-center gap-2 text-white">
                <Upload className="h-5 w-5 text-orange-400" />
                Markdown Questions
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="text-sm text-gray-400">
                  <p className="mb-2">Format guidelines:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li><code className="text-orange-400"># Title</code> - Quiz content title</li>
                    <li><code className="text-orange-400">## Content</code> - Learning material section</li>
                    <li><code className="text-orange-400">## Questions</code> - Questions section</li>
                    <li><code className="text-orange-400">### Question text</code> - Individual questions</li>
                    <li><code className="text-orange-400">- Option text</code> - Answer options</li>
                    <li><code className="text-orange-400">- **Correct answer**</code> - Mark correct with bold</li>
                    <li><code className="text-orange-400">*Explanation: text</code> - Question explanation</li>
                  </ul>
                </div>

                <Textarea
                  value={markdown}
                  onChange={(e) => setMarkdown(e.target.value)}
                  placeholder="Enter your markdown here..."
                  className="bg-gray-800 border-gray-700 font-mono text-sm text-white placeholder-gray-500 focus:border-orange-500"
                  rows={20}
                />

                <div className="flex gap-2">
                  <Button 
                    onClick={handleParseMarkdown}
                    variant="outline"
                    className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-orange-500"
                  >
                    Parse Markdown
                  </Button>
                  <Button
                    onClick={() => setShowPreview(!showPreview)}
                    variant="outline"
                    size="icon"
                    className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-orange-500"
                  >
                    {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview Section */}
        {showPreview && parsedQuiz && (
          <Card className="mt-8 bg-gray-900 border-orange-500/20">
            <CardHeader className="border-b border-orange-500/20">
              <CardTitle className="text-white">Quiz Preview</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{parsedQuiz.title}</h3>
                  <p className="text-gray-400">{parsedQuiz.content}</p>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-white">Questions ({parsedQuiz.questions.length})</h4>
                  {parsedQuiz.questions.map((question, index) => (
                    <div key={question.id} className="border border-gray-700 rounded-md p-4 bg-gray-800/50">
                      <h5 className="font-medium mb-2 text-white">{index + 1}. {question.question}</h5>
                      <div className="space-y-2">
                        {question.options.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex items-center gap-2">
                            <Badge variant={optionIndex === question.correctAnswer ? "default" : "outline"} 
                                   className={optionIndex === question.correctAnswer ? 
                                     "bg-orange-500 text-white" : 
                                     "border-gray-600 text-gray-300"}>
                              {String.fromCharCode(65 + optionIndex)}
                            </Badge>
                            <span className={optionIndex === question.correctAnswer ? "text-orange-400" : "text-gray-300"}>
                              {option}
                            </span>
                          </div>
                        ))}
                      </div>
                      {question.explanation && (
                        <p className="text-sm text-gray-400 mt-2">
                          <strong className="text-white">Explanation:</strong> {question.explanation}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit Section */}
        {parsedQuiz && (
          <div className="mt-8 flex justify-center">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !title || !description}
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Creating Quiz...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Create Quiz
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
