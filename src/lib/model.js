import mongoose from "mongoose";

// User Schema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  image: String,
  provider: {
    type: String,
    enum: ['google', 'github'],
    required: true
  },
  username: String, // For GitHub
  githubId: String, // For GitHub
  createdAt: {
    type: Date,
    default: Date.now
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  completedQuizzes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz'
  }],
  rewards: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reward'
  }]
});

// Quiz Schema
const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  image: String,
  questions: [{
    question: {
      type: String,
      required: true
    },
    answers: [{
      text: String,
      isCorrect: Boolean
    }],
    points: {
      type: Number,
      default: 10
    }
  }],
  totalPoints: Number,
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

// Quiz Completion Schema
const quizCompletionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  answers: [{
    questionIndex: Number,
    selectedAnswer: Number,
    isCorrect: Boolean,
    pointsEarned: Number
  }],
  totalPointsEarned: Number,
  completedAt: {
    type: Date,
    default: Date.now
  }
});

// Reward Schema
const rewardSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['quiz_completion', 'milestone', 'streak', 'special'],
    required: true
  },
  title: String,
  description: String,
  points: Number,
  badge: String, // URL to badge image
  earnedAt: {
    type: Date,
    default: Date.now
  }
});

// Create models
const User = mongoose.models.User || mongoose.model("User", userSchema);
const Quiz = mongoose.models.Quiz || mongoose.model("Quiz", quizSchema);
const QuizCompletion = mongoose.models.QuizCompletion || mongoose.model("QuizCompletion", quizCompletionSchema);
const Reward = mongoose.models.Reward || mongoose.model("Reward", rewardSchema);

export default User;
export { Quiz, QuizCompletion, Reward };