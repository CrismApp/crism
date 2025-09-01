// lib/auth.js
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { connectToDb } from "@/lib/db";
import User from "@/lib/model";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      authorization: {
        params: {
          scope: 'read:user user:email repo'
        }
      }
    }),
  ],
  callbacks: {
    async jwt(params) {
      const { token, account, profile } = params;
      if (account) {
        token.accessToken = account.access_token;
        token.provider = account.provider;
        // Add GitHub-specific data when the provider is GitHub
        if (account.provider === 'github' && profile) {
          token.username = profile.login;
          token.githubId = profile.id;
        }
      }
      return token;
    },
    async session(params) {
      const { session, token } = params;
      session.user.accessToken = token.accessToken;
      session.user.provider = token.provider;
      // Add GitHub-specific data to the session when provider is GitHub
      if (token.provider === 'github') {
        session.user.username = token.username;
        session.user.githubId = token.githubId;
      }
      return session;
    },
    async signIn(params) {
      const { user, account, profile } = params;
      try {
        await connectToDb();
        
        // Handle cases where profile might be undefined
        if (!profile || !account) {
          return false;
        }
        
        const existingUser = await User.findOne({ email: profile.email });
        
        const userData = {
          email: profile.email,
          name: profile.name || profile.login,
          image: profile.avatar_url || profile.picture,
          provider: account.provider,
        };

        // Add GitHub-specific data when the provider is GitHub
        if (account.provider === 'github') {
          userData.username = profile.login;
          userData.githubId = profile.id;
        }

        if (!existingUser) {
          await User.create(userData);
        } else {
          // Update existing user with new data
          await User.findOneAndUpdate(
            { email: profile.email },
            userData,
            { new: true }
          );
        }
        return true;
      } catch (error) {
        console.error("Error during sign-in:", error);
        return false;
      }
    },
  },
  pages: {
    signIn: '/login',
    error: '/error',
  },
  secret: process.env.AUTH_SECRET,
};

export default NextAuth(authOptions);