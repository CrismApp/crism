// lib/models.ts
import mongoose from "mongoose";

// Better Auth User Schema (extends the auto-generated user collection)
const userSchema = new mongoose.Schema({
  // Better Auth required fields
  id: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  name: {
    type: String,
    required: true
  },
  image: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },

  // Custom fields for CRISM
  walletAddress: {
    type: String,
    required: false
  },
  goldAccumulated: {
    type: Number,
    default: 0
  },
  rank: {
    type: String,
    enum: ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'],
    default: 'Bronze'
  },
  
  // Your existing quiz/reward fields
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
  }],
  
  // Additional tracking fields
  lastLoginAt: {
    type: Date,
    default: Date.now
  },
  portfolioValue: {
    type: Number,
    default: 0
  },
  transactionCount: {
    type: Number,
    default: 0
  }
});

// Better Auth Session Schema
const sessionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  expiresAt: {
    type: Date,
    required: true
  },
  token: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Better Auth Account Schema (for OAuth providers)
const accountSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  accountId: {
    type: String,
    required: true
  },
  providerId: {
    type: String,
    required: true
  },
  accessToken: String,
  refreshToken: String,
  expiresAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Better Auth Verification Schema
const verificationSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  identifier: {
    type: String,
    required: true
  },
  value: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Your existing Quiz Schema (unchanged)
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
    type: String, // Changed to String to match Better Auth user ID
    ref: 'User'
  }
});

// Quiz Completion Schema (updated to use Better Auth user ID)
const quizCompletionSchema = new mongoose.Schema({
  user: {
    type: String, // Changed to String to match Better Auth user ID
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

// Reward Schema (updated to use Better Auth user ID)
const rewardSchema = new mongoose.Schema({
  user: {
    type: String, // Changed to String to match Better Auth user ID
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['quiz_completion', 'milestone', 'streak', 'special', 'wallet_connect', 'first_transaction'],
    required: true
  },
  title: String,
  description: String,
  points: Number,
  goldAwarded: {
    type: Number,
    default: 0
  },
  badge: String, // URL to badge image
  earnedAt: {
    type: Date,
    default: Date.now
  }
});

// Portfolio Activity Schema (new)
const portfolioActivitySchema = new mongoose.Schema({
  user: {
    type: String,
    ref: 'User',
    required: true
  },
  walletAddress: {
    type: String,
    required: true
  },
  activityType: {
    type: String,
    enum: ['wallet_connect', 'transaction', 'defi_position', 'yield_farm', 'bridge'],
    required: true
  },
  transactionHash: String,
  amount: Number,
  tokenSymbol: String,
  goldEarned: {
    type: Number,
    default: 0
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
});

// Create models
const User = mongoose.models.User || mongoose.model("User", userSchema);
const Session = mongoose.models.Session || mongoose.model("Session", sessionSchema);
const Account = mongoose.models.Account || mongoose.model("Account", accountSchema);
const Verification = mongoose.models.Verification || mongoose.model("Verification", verificationSchema);
const Quiz = mongoose.models.Quiz || mongoose.model("Quiz", quizSchema);
const QuizCompletion = mongoose.models.QuizCompletion || mongoose.model("QuizCompletion", quizCompletionSchema);
const Reward = mongoose.models.Reward || mongoose.model("Reward", rewardSchema);
const PortfolioActivity = mongoose.models.PortfolioActivity || mongoose.model("PortfolioActivity", portfolioActivitySchema);

export default User;
export { 
  User,
  Session, 
  Account, 
  Verification,
  Quiz, 
  QuizCompletion, 
  Reward,
  PortfolioActivity 
};