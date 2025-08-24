"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight, BarChart3, TrendingUp, Globe, Menu, X } from "lucide-react"
import { useState } from "react"

interface LandingPageProps {
  onGetStarted: () => void
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  return (
    <div className="min-h-screen bg-black text-white text-2xl">
      {/* Header */}
      <header className="border-b border-orange-500/20 bg-black/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="text-xl font-bold text-orange-500">Crism</span>
            </div>
          <nav className="hidden md:flex items-center gap-6 text-2xl">
            <a href="#features" className="text-gray-300 hover:text-orange-500 transition-colors">
              Features
            </a>
            <a href="/docs" className="text-gray-300 hover:text-orange-500 transition-colors">
              Docs
            </a>
            <a href="#about" className="text-gray-300 hover:text-orange-500 transition-colors">
              About
            </a>
            <a href="#contact" className="text-gray-300 hover:text-orange-500 transition-colors">
              Contact
            </a>
          </nav>
          <div className="flex items-center gap-4">
            <Button onClick={onGetStarted} className="bg-orange-500 hover:bg-orange-600 text-xl">
              Launch App
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
          <div className="md:hidden bg-black/90 backdrop-blur border-t border-orange-500/20">
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
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-orange-500 to-orange-300 bg-clip-text text-transparent">
            Track Your Bitcoin L2 Portfolio
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Monitor your Citrea wallet balances, DeFi positions, yield farming rewards, and cross-chain activities in
            real-time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={onGetStarted} size="lg" className="bg-orange-500 hover:bg-orange-600 text-lg px-8 py-3">
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-black text-lg px-8 py-3 bg-transparent"
              onClick={() => window.open('/docs', '_blank')}
            >
              View Documentation
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Why CRISM?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="p-6 bg-gray-900/50 border-orange-500/20">
            <BarChart3 className="h-12 w-12 text-orange-500 mb-4" />
            <h3 className="text-xl font-semibold mb-3">Portfolio Tracking</h3>
            <p className="text-gray-300">
              Real-time portfolio valuation in CBTC/USD with comprehensive wallet balance monitoring across Citrea.
            </p>
          </Card>
          <Card className="p-6 bg-gray-900/50 border-orange-500/20">
            <TrendingUp className="h-12 w-12 text-orange-500 mb-4" />
            <h3 className="text-xl font-semibold mb-3">DeFi Analytics</h3>
            <p className="text-gray-300">
              Track yield farming rewards, staking returns, and monitor all your DeFi positions in one place.
            </p>
          </Card>
          <Card className="p-6 bg-gray-900/50 border-orange-500/20">
            <Globe className="h-12 w-12 text-orange-500 mb-4" />
            <h3 className="text-xl font-semibold mb-3">Cross-Chain Bridge</h3>
            <p className="text-gray-300">
              Monitor cross-chain bridge activities and transaction history across different networks.
            </p>
          </Card>
        </div>

        {/* Documentation CTA */}
        <div className="mt-16 text-center">
          <Card className="p-8 bg-gradient-to-r from-orange-500/10 to-orange-600/5 border-orange-500/20 max-w-2xl mx-auto">
            <h3 className="text-2xl font-semibold mb-4">📚 Complete Documentation Available</h3>
            <p className="text-gray-300 mb-6">
              Get comprehensive guides, API documentation, technical architecture details, and step-by-step tutorials to make the most of CRISM.
            </p>
            <Button 
              variant="outline" 
              size="lg"
              className="border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-black text-lg px-8 py-3 bg-transparent"
              onClick={() => window.open('/docs', '_blank')}
            >
              Explore Documentation <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="bg-gradient-to-r from-orange-500/10 to-orange-600/10 py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-orange-500 mb-2">$2.4B+</div>
              <div className="text-gray-300">Total Value Tracked</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-500 mb-2">15K+</div>
              <div className="text-gray-300">Active Users</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-500 mb-2">50+</div>
              <div className="text-gray-300">DeFi Protocols</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-500 mb-2">99.9%</div>
              <div className="text-gray-300">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold mb-6">Ready to Track Your Bitcoin L2 Portfolio?</h2>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Join thousands of Bitcoin holders who trust CitreaTracker to monitor their L2 activities.
        </p>
        <Button onClick={onGetStarted} size="lg" className="bg-orange-500 hover:bg-orange-600 text-lg px-8 py-3">
          Launch App Now <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </section>

      {/* Footer */}
      <footer className="border-t border-orange-500/20 bg-black/50 backdrop-blur py-8">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>&copy; 2024 CitreaTracker. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
