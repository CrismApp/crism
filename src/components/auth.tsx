"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { signIn, signUp } from "@/lib/auth-client"
import { AlertCircle, Mail, Lock, User } from "lucide-react"

interface User {
  id: string
  email: string
  name: string
  [key: string]: unknown
}

interface AuthProps {
  onAuthSuccess: (user: User) => void
}

export function Auth({ onAuthSuccess }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  })

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await signIn.social({
        provider: "google",
        callbackURL: "/dashboard"
      })
      
      if (result.data && 'user' in result.data && result.data.user) {
        onAuthSuccess(result.data.user)
      }
    } catch {
      setError("Failed to sign in with Google")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (isLogin) {
        const result = await signIn.email({
          email: formData.email,
          password: formData.password,
        })
        
        if (result.data && 'user' in result.data && result.data.user) {
          onAuthSuccess(result.data.user)
        }
      } else {
        const result = await signUp.email({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        })
        
        if (result.data && 'user' in result.data && result.data.user) {
          onAuthSuccess(result.data.user)
        }
      }
    } catch {
      setError(isLogin ? "Failed to sign in" : "Failed to sign up")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 border-orange-500/20 bg-black/50 backdrop-blur-xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            {isLogin ? "Welcome to Crism" : "Create Account"}
          </h2>
          <p className="text-gray-300">
            {isLogin ? "Sign in to your account" : "Join CRISM to track your portfolio"}
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg mb-6">
            <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
            <span className="text-red-400 text-sm">{error}</span>
          </div>
        )}

        {/* Google Sign In */}
        <Button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          variant="outline"
          className="w-full mb-6 border-gray-600 text-white hover:bg-white hover:text-black py-3 text-base"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-gray-400 border-t-white rounded-full animate-spin mr-2"></div>
          ) : (
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          Continue with Google
        </Button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-black text-gray-400">or</span>
          </div>
        </div>

        {/* Email Form */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          {!isLogin && (
            <div>
              <Label htmlFor="name" className="text-white">Full Name</Label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="pl-10 bg-gray-900 border-gray-700 text-white"
                  placeholder="Enter your full name"
                  required={!isLogin}
                />
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="email" className="text-white">Email</Label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="pl-10 bg-gray-900 border-gray-700 text-white"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="password" className="text-white">Password</Label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="pl-10 bg-gray-900 border-gray-700 text-white"
                placeholder="Enter your password"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-orange-500 hover:bg-orange-600 py-3 text-base"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                {isLogin ? "Signing In..." : "Creating Account..."}
              </div>
            ) : (
              isLogin ? "Sign In" : "Create Account"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-orange-500 hover:text-orange-400 text-sm"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </Card>
    </div>
  )
}