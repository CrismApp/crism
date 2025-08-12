"use client"

import { useEffect, useState } from "react"

export function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer)
          setTimeout(onComplete, 500)
          return 100
        }
        return prev + 2
      })
    }, 50)

    return () => clearInterval(timer)
  }, [onComplete])

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      <div className="text-center">
        {/* Spinning Prism */}
        <div className="relative w-32 h-32 mx-auto mb-8">
          <div className="absolute inset-0 animate-spin">
            <div className="w-full h-full bg-gradient-to-r from-orange-500 to-orange-600 transform rotate-45 rounded-lg shadow-2xl shadow-orange-500/50"></div>
          </div>
          <div
            className="absolute inset-2 animate-spin"
            style={{ animationDirection: "reverse", animationDuration: "3s" }}
          >
            <div className="w-full h-full bg-gradient-to-l from-orange-400 to-orange-500 transform rotate-45 rounded-lg opacity-80"></div>
          </div>
          <div className="absolute inset-4 animate-spin" style={{ animationDuration: "2s" }}>
            <div className="w-full h-full bg-gradient-to-r from-orange-300 to-orange-400 transform rotate-45 rounded-lg opacity-60"></div>
          </div>
        </div>

        {/* Loading Text */}
        <h2 className="text-2xl font-bold text-orange-500 mb-4">CRISM</h2>
        <p className="text-orange-300 mb-6">Loading your Bitcoin L2 portfolio...</p>

        {/* Progress Bar */}
        <div className="w-64 h-2 bg-gray-800 rounded-full mx-auto overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-orange-400 mt-2 text-sm">{progress}%</p>
      </div>
    </div>
  )
}
