"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight, BarChart3, TrendingUp, Globe, Menu, X, ChevronDown } from "lucide-react"
import { useState, useEffect } from "react"


interface LandingPageProps {
  onGetStarted: () => void
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  // Mouse tracking for interactive effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white relative overflow-hidden">

      {/* Additional subtle background elements for depth */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-orange-500/10 to-orange-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-orange-500/8 to-orange-600/8 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-orange-500/5 to-orange-600/5 rounded-full blur-2xl animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Interactive cursor trail */}
      <div 
        className="absolute w-8 h-8 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full opacity-30 blur-sm pointer-events-none transition-all duration-100 ease-out"
        style={{
          left: mousePosition.x - 16,
          top: mousePosition.y - 16,
          transform: `scale(${Math.sin(Date.now() * 0.01) * 0.3 + 0.7})`
        }}
      ></div>

      {/* Header */}
      <header className="relative z-50 backdrop-blur-xl pt-5">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="h-8 w-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/25">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg blur opacity-30 animate-pulse"></div>
            </div>
            <span className="text-xl font-bold text-orange-500">Crism</span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-2xl">
            <a href="#features" className="text-gray-300 hover:text-orange-500 transition-all duration-300 hover:scale-105">
              Features
            </a>
            <a href="/docs" className="text-gray-300 hover:text-orange-500 transition-all duration-300 hover:scale-105">
              Docs
            </a>
            <a href="#about" className="text-gray-300 hover:text-orange-500 transition-all duration-300 hover:scale-105">
              About
            </a>
            <a href="#contact" className="text-gray-300 hover:text-orange-500 transition-all duration-300 hover:scale-105">
              Contact
            </a>
          </nav>

          <div className="flex items-center gap-4">
          
            <Button 
              onClick={onGetStarted} 
              className="bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/25 transition-all duration-300 hover:scale-105"
            >
              Launch Beta
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="md:hidden text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-black/90 backdrop-blur border-t border-orange-500/20 animate-in slide-in-from-top-2 duration-300">
            <nav className="container mx-auto px-4 py-4 space-y-4">
              <a 
                href="#features" 
                className="block text-gray-300 hover:text-orange-500 transition-colors text-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </a>
              <a 
                href="/docs" 
                className="block text-gray-300 hover:text-orange-500 transition-colors text-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Documentation
              </a>
              <a 
                href="#about" 
                className="block text-gray-300 hover:text-orange-500 transition-colors text-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </a>
              <a 
                href="#contact" 
                className="block text-gray-300 hover:text-orange-500 transition-colors text-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </a>
              <Button 
                variant="outline" 
                className="w-full border-orange-500/50 text-orange-300 hover:bg-orange-500/20 mt-4"
              >
                Connect Wallet
              </Button>
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto relative z-10">
          {/* Floating badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500/20 to-orange-600/10 border border-orange-500/30 rounded-full px-6 py-2 mb-8 backdrop-blur-sm animate-bounce">
            <span className="text-sm font-medium">Bitcoin L2 Portfolio Tracker</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-orange-500 to-orange-300 bg-clip-text text-transparent block animate-in slide-in-from-bottom-4 duration-1000">
              Track Your Bitcoin
            </span>
            <span className="bg-gradient-to-r from-orange-300 to-orange-500 bg-clip-text text-transparent block animate-in slide-in-from-bottom-4 duration-1000 delay-300">
              L2 Portfolio
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto animate-in slide-in-from-bottom-4 duration-1000 delay-500">
            Monitor your Citrea wallet balances, DeFi positions, yield farming rewards, and cross-chain activities in
            real-time.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-in slide-in-from-bottom-4 duration-1000 delay-700">
            <Button 
              onClick={onGetStarted} 
              size="lg" 
              className="bg-orange-500 hover:bg-orange-600 text-lg px-8 py-3 shadow-xl shadow-orange-500/25 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/40"
            >
              Launch Beta <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-black text-lg px-8 py-3 bg-transparent transition-all duration-300 hover:scale-105"
              onClick={() => window.open('/docs', '_blank')}
            >
              View Documentation
            </Button>
          </div>

          {/* Scroll indicator */}
          <div className="animate-bounce">
            <ChevronDown className="h-8 w-8 text-gray-400 mx-auto" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-orange-300 bg-clip-text text-transparent">
            Why CRISM?
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="group p-6  border-orange-500/20 backdrop-blur-xl hover:scale-105 transition-all duration-500 cursor-pointer relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-orange-600/10 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
            <BarChart3 className="h-12 w-12 text-orange-500 mb-4" />
            <h3 className="text-xl font-semibold mb-3">Portfolio Tracking</h3>
            <p className="text-gray-300">
              Real-time portfolio valuation in CBTC/USD with comprehensive wallet balance monitoring across Citrea.
            </p>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500/50 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
          </Card>

          <Card className="group p-6  border-orange-500/20 backdrop-blur-xl hover:scale-105 transition-all duration-500 cursor-pointer relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-orange-600/10 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
            <TrendingUp className="h-12 w-12 text-orange-500 mb-4" />
            <h3 className="text-xl font-semibold mb-3">DeFi Analytics</h3>
            <p className="text-gray-300">
              Track yield farming rewards, staking returns, and monitor all your DeFi positions in one place.
            </p>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500/50 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
          </Card>

          <Card className="group p-6  border-orange-500/20 backdrop-blur-xl hover:scale-105 transition-all duration-500 cursor-pointer relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-orange-600/10 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
            <Globe className="h-12 w-12 text-orange-500 mb-4" />
            <h3 className="text-xl font-semibold mb-3">Cross-Chain Bridge</h3>
            <p className="text-gray-300">
              Monitor cross-chain bridge activities and transaction history across different networks.
            </p>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500/50 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
          </Card>
        </div>

        {/* Documentation CTA */}
        <div className="mt-16 text-center">
          <Card className="p-8 bg-gradient-to-r from-orange-500/10 to-orange-600/5 border-orange-500/20 max-w-2xl mx-auto backdrop-blur-xl">
            <h3 className="text-2xl font-semibold mb-4">Complete Documentation Available</h3>
            <p className="text-gray-300 mb-6">
              Get comprehensive guides, API documentation, technical architecture details, and step-by-step tutorials to make the most of CRISM.
            </p>
            <Button 
              variant="outline" 
              size="lg"
              className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-black text-lg px-8 py-3 bg-transparent transition-all duration-300 hover:scale-105"
              onClick={() => window.open('/docs', '_blank')}
            >
              Explore Documentation <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="relative py-20 bg-gradient-to-r from-orange-500/10 to-orange-600/10 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { value: "$2.4B+", label: "Total Value Tracked" },
              { value: "15K+", label: "Active Users" },
              { value: "50+", label: "DeFi Protocols" },
              { value: "99.9%", label: "Uptime" }
            ].map((stat, index) => (
              <div key={index} className="group animate-in slide-in-from-bottom-4 duration-1000" style={{animationDelay: `${index * 0.1}s`}}>
                <div className="text-3xl font-bold text-orange-500 mb-2 group-hover:scale-110 transition-transform duration-300">
                  {stat.value}
                </div>
                <div className="text-gray-300">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-orange-500 to-orange-300 bg-clip-text text-transparent">Ready to Track Your Bitcoin L2 Portfolio?</h2>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Join thousands of Bitcoin holders who trust Crism to monitor their L2 activities.
        </p>
        
        <div className="relative inline-block">
          <div className="absolute -inset-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl blur-xl opacity-70 animate-pulse"></div>
          <Button 
            onClick={onGetStarted} 
            size="lg" 
            className="relative bg-orange-500 hover:bg-orange-600 text-lg px-8 py-3 shadow-2xl  transition-all duration-300 hover:scale-110"
          >
            Launch Beta<ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="backdrop-blur py-8">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>&copy; 2025 Crism. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}