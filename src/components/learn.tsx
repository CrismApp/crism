"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import Image from "next/image";
import { 
  BookOpen, 
  Play, 
  Clock, 
  Star, 
  CheckCircle, 
  XCircle,
  ArrowRight,
  ArrowLeft,
  Trophy
} from "lucide-react";

interface Quiz {
  _id: string;
  title: string;
  description: string;
  image?: string;
  questions: Question[];
  totalPoints: number;
  isActive: boolean;
}

interface Question {
  question: string;
  answers: Answer[];
  points: number;
}

interface Answer {
  text: string;
  isCorrect: boolean;
}

interface QuizState {
  currentQuestionIndex: number;
  selectedAnswers: number[];
  showResults: boolean;
  score: number;
  totalPossibleScore: number;
}

export default function Learn() {
  const { data: session } = useSession();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestionIndex: 0,
    selectedAnswers: [],
    showResults: false,
    score: 0,
    totalPossibleScore: 0
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const response = await fetch('/api/quizzes');
      if (response.ok) {
        const data = await response.json();
        setQuizzes(data);
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setQuizState({
      currentQuestionIndex: 0,
      selectedAnswers: new Array(quiz.questions.length).fill(-1),
      showResults: false,
      score: 0,
      totalPossibleScore: quiz.totalPoints
    });
  };

  const selectAnswer = (answerIndex: number) => {
    const newSelectedAnswers = [...quizState.selectedAnswers];
    newSelectedAnswers[quizState.currentQuestionIndex] = answerIndex;
    setQuizState(prev => ({
      ...prev,
      selectedAnswers: newSelectedAnswers
    }));
  };

  const nextQuestion = () => {
    if (selectedQuiz && quizState.currentQuestionIndex < selectedQuiz.questions.length - 1) {
      setQuizState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1
      }));
    } else {
      finishQuiz();
    }
  };

  const previousQuestion = () => {
    if (quizState.currentQuestionIndex > 0) {
      setQuizState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex - 1
      }));
    }
  };

  const finishQuiz = async () => {
    if (!selectedQuiz || !session) return;

    setSubmitting(true);
    
    // Calculate score
    let totalScore = 0;
    const answers = quizState.selectedAnswers.map((selectedAnswer, questionIndex) => {
      const question = selectedQuiz.questions[questionIndex];
      const isCorrect = selectedAnswer !== -1 && question.answers[selectedAnswer]?.isCorrect;
      const pointsEarned = isCorrect ? question.points : 0;
      totalScore += pointsEarned;
      
      return {
        questionIndex,
        selectedAnswer,
        isCorrect,
        pointsEarned
      };
    });

    try {
      // Submit quiz completion
      const response = await fetch('/api/quiz/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quizId: selectedQuiz._id,
          answers,
          totalPointsEarned: totalScore
        }),
      });

      if (response.ok) {
        setQuizState(prev => ({
          ...prev,
          showResults: true,
          score: totalScore
        }));
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const resetQuiz = () => {
    setSelectedQuiz(null);
    setQuizState({
      currentQuestionIndex: 0,
      selectedAnswers: [],
      showResults: false,
      score: 0,
      totalPossibleScore: 0
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Quiz Results View
  if (selectedQuiz && quizState.showResults) {
    const percentage = (quizState.score / quizState.totalPossibleScore) * 100;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8 text-center">
            <Trophy className="mx-auto h-16 w-16 text-yellow-500 mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Quiz Complete!</h2>
            <p className="text-xl text-gray-600 mb-6">{selectedQuiz.title}</p>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {quizState.score}/{quizState.totalPossibleScore}
              </div>
              <div className="text-lg text-gray-600 mb-4">Points Earned</div>
              <Progress value={percentage} className="w-full h-3" />
              <div className="text-sm text-gray-500 mt-2">{percentage.toFixed(1)}% Score</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {selectedQuiz.questions.map((question, index) => {
                const selectedAnswer = quizState.selectedAnswers[index];
                const isCorrect = selectedAnswer !== -1 && question.answers[selectedAnswer]?.isCorrect;
                
                return (
                  <div key={index} className="text-left border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Question {index + 1}</span>
                      {isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{question.question}</p>
                    <div className="text-xs">
                      <span className={isCorrect ? "text-green-600" : "text-red-600"}>
                        {isCorrect ? `+${question.points} points` : "0 points"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-4 justify-center">
              <Button onClick={resetQuiz} variant="outline">
                Back to Quizzes
              </Button>
              <Button onClick={() => window.location.href = '/profile'}>
                View Profile
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Quiz Taking View
  if (selectedQuiz && !quizState.showResults) {
    const currentQuestion = selectedQuiz.questions[quizState.currentQuestionIndex];
    const progress = ((quizState.currentQuestionIndex + 1) / selectedQuiz.questions.length) * 100;
    const selectedAnswer = quizState.selectedAnswers[quizState.currentQuestionIndex];
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <Card className="p-8">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">{selectedQuiz.title}</h2>
                <Badge variant="outline">
                  {quizState.currentQuestionIndex + 1} of {selectedQuiz.questions.length}
                </Badge>
              </div>
              <Progress value={progress} className="w-full h-2" />
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                {currentQuestion.question}
              </h3>

              <div className="space-y-3">
                {currentQuestion.answers.map((answer, index) => (
                  <button
                    key={index}
                    onClick={() => selectAnswer(index)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                      selectedAnswer === index
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                        selectedAnswer === index ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                      }`}>
                        {selectedAnswer === index && (
                          <div className="w-2 h-2 bg-white rounded-full m-0.5" />
                        )}
                      </div>
                      <span className="text-gray-900">{answer.text}</span>
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
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>

              <div className="text-sm text-gray-500 flex items-center">
                <Star className="mr-1 h-4 w-4" />
                {currentQuestion.points} points
              </div>

              <Button
                onClick={nextQuestion}
                disabled={selectedAnswer === -1}
                className={submitting ? "opacity-50" : ""}
              >
                {quizState.currentQuestionIndex === selectedQuiz.questions.length - 1 ? (
                  submitting ? "Submitting..." : "Finish Quiz"
                ) : (
                  <>
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Quiz List View
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Learn & Earn</h1>
          <p className="text-lg text-gray-600">
            Complete quizzes to earn points and unlock rewards
          </p>
        </div>

        {quizzes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <Card key={quiz._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {quiz.image && (
                  <Image
                    src={quiz.image}
                    alt={quiz.title}
                    className="w-full h-48 object-cover"
                    width={500}
                    height={200}
                  />
                )}
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {quiz.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{quiz.description}</p>
                  
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
                    className="w-full"
                    disabled={!session}
                  >
                    <Play className="mr-2 h-4 w-4" />
                    {session ? "Start Quiz" : "Sign in to start"}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <BookOpen className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Quizzes Available</h3>
            <p className="text-gray-600">Check back later for new learning opportunities!</p>
          </Card>
        )}
      </div>
    </div>
  );
}