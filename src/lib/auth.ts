// lib/auth.ts
import { betterAuth } from "better-auth"
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient, Db } from "mongodb";
import { User } from "./model";
import { connectToDb } from "./db";


connectToDb().catch(console.error);

let client: MongoClient | undefined;
let db: Db | undefined;

try {
  client = new MongoClient(process.env.MONGO_URI!, {
    ssl: true,
    serverSelectionTimeoutMS: 30000,
    connectTimeoutMS: 30000,
    retryWrites: true
  });
  db = client.db("crismapp");
} catch (error) {
  console.error("Failed to initialize MongoDB client:", error);
 
  if (process.env.NODE_ENV === 'development') {
    console.warn("Using fallback configuration for development");
  }
}

export const auth = betterAuth({
  database: db ? mongodbAdapter(db) : undefined,
  
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, 
  },
  
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  
  user: {
    additionalFields: {
      walletAddress: {
        type: "string",
        required: false,
      },
      goldAccumulated: {
        type: "number",
        required: false,
        defaultValue: 0,
      },
      rank: {
        type: "string",
        required: false,
        defaultValue: "Bronze",
      },
      totalPoints: {
        type: "number",
        required: false,
        defaultValue: 0,
      },
      lastLoginAt: {
        type: "date",
        required: false,
      },
      portfolioValue: {
        type: "number",
        required: false,
        defaultValue: 0,
      },
      transactionCount: {
        type: "number",
        required: false,
        defaultValue: 0,
      }
    }
  },
  
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, 
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24 * 30, // 30 days
    },
  },
  
  advanced: {
    database: {
      generateId: () => {
        // Generate a custom ID format if needed
        return crypto.randomUUID();
      }
    }
  },

  callbacks: {
    async signIn(ctx: { user?: { id: string; [key: string]: unknown } }) {
      // Update last login time
      if (ctx.user?.id) {
        try {
          await User.findOneAndUpdate(
            { id: ctx.user.id },
            { 
              lastLoginAt: new Date(),
              updatedAt: new Date()
            }
          );
        } catch (error) {
          console.error("Failed to update last login:", error);
        }
      }
      return ctx;
    },
    
    async signUp(ctx: { user?: { id: string; [key: string]: unknown } }) {
      // Initialize user with default values
      if (ctx.user?.id) {
        try {
          await User.findOneAndUpdate(
            { id: ctx.user.id },
            { 
              goldAccumulated: 0,
              rank: 'Bronze',
              totalPoints: 0,
              lastLoginAt: new Date(),
              portfolioValue: 0,
              transactionCount: 0,
              completedQuizzes: [],
              rewards: []
            },
            { upsert: true }
          );
          
          console.log(`✅ New user initialized: ${ctx.user.id}`);
          
        } catch (error) {
          console.error("Failed to initialize new user:", error);
        }
      }
      return ctx;
    }
  }
});

export type Session = typeof auth.$Infer.Session;