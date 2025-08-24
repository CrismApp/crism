"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeft, 
  BookOpen, 
  Rocket, 
  BarChart3, 
  Gift, 
  ShoppingBag, 
  Code, 
  HelpCircle,
  ExternalLink,
  Copy,
  ChevronRight,
  Star,
  Zap,
  Shield,
  TrendingUp,
  Globe,
  Target,
  Award,
  Settings,
  FileText,
  Link as LinkIcon,
  Menu,
  X,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Home,
  User,
  Wallet,
  Search,
  Info
} from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"

export default function DocsPage() {
  const [copiedText, setCopiedText] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("overview")

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopiedText(label)
    setTimeout(() => setCopiedText(""), 2000)
  }

  // Handle scroll tracking for active section
  useEffect(() => {
    const handleScroll = () => {
      const sections = tableOfContents.map(item => item.id)
      const scrollPosition = window.scrollY + 100

      for (let i = sections.length - 1; i >= 0; i--) {
        const element = document.getElementById(sections[i])
        if (element && element.offsetTop <= scrollPosition) {
          setActiveSection(sections[i])
          break
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const tableOfContents = [
    { id: "overview", title: "Overview", icon: BookOpen, level: 1 },
    { id: "getting-started", title: "Getting Started", icon: Rocket, level: 1 },
    { id: "installation", title: "Installation", icon: Settings, level: 2 },
    { id: "wallet-setup", title: "Wallet Setup", icon: Wallet, level: 2 },
    { id: "core-features", title: "Core Features", icon: BarChart3, level: 1 },
    { id: "portfolio-dashboard", title: "Portfolio Dashboard", icon: TrendingUp, level: 2 },
    { id: "marketplace", title: "Marketplace", icon: ShoppingBag, level: 2 },
    { id: "prism-nft", title: "Prism NFT System", icon: Gift, level: 2 },
    { id: "user-guide", title: "User Guide", icon: FileText, level: 1 },
    { id: "navigation", title: "Navigation", icon: Search, level: 2 },
    { id: "features-overview", title: "Features Overview", icon: Star, level: 2 },
    { id: "api-docs", title: "API Documentation", icon: Code, level: 1 },
    { id: "architecture", title: "Technical Architecture", icon: Settings, level: 1 },
    { id: "troubleshooting", title: "Troubleshooting", icon: AlertCircle, level: 1 },
    { id: "faq", title: "FAQ", icon: HelpCircle, level: 1 }
  ]

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setSidebarOpen(false) // Close mobile sidebar after navigation
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-orange-500/20 bg-black/50 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 lg:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="sm" className="border-orange-500/20 text-orange-500 hover:bg-orange-500/10">
                <ArrowLeft className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Back to Home</span>
                <span className="sm:hidden">Back</span>
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="text-lg lg:text-xl font-bold">Crism Docs</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-orange-500 text-orange-500 hidden sm:inline-flex">
              v1.0.0
            </Badge>
            {/* Mobile menu button */}
            <Button
              variant="outline"
              size="sm"
              className="lg:hidden border-orange-500/20 text-orange-500"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </header>

      <div className="flex relative">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed lg:sticky top-[73px] left-0 z-50 lg:z-auto
          w-80 lg:w-72 xl:w-80 h-[calc(100vh-73px)] overflow-y-auto
          border-r border-orange-500/20 bg-gray-900/95 lg:bg-gray-900/20 backdrop-blur-sm
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <nav className="p-4 lg:p-6">
            <div className="flex items-center justify-between mb-6 lg:mb-4">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
                Documentation
              </h3>
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden text-gray-400"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <ul className="space-y-1">
              {tableOfContents.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => scrollToSection(item.id)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 lg:py-2 rounded-lg transition-all duration-200 group text-left
                      ${activeSection === item.id 
                        ? 'text-orange-500 bg-orange-500/10 border-l-2 border-orange-500' 
                        : 'text-gray-300 hover:text-orange-500 hover:bg-orange-500/5'
                      }
                      ${item.level === 2 ? 'ml-4 text-sm' : 'text-base lg:text-sm'}
                    `}
                  >
                    <item.icon className={`h-4 w-4 ${item.level === 2 ? 'opacity-70' : ''}`} />
                    <span className="flex-1">{item.title}</span>
                    <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                </li>
              ))}
            </ul>

            {/* Quick Actions */}
            <div className="mt-8 pt-6 border-t border-gray-700">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                Quick Actions
              </h4>
              <div className="space-y-2">
                <Link href="/" className="flex items-center gap-2 text-sm text-gray-400 hover:text-orange-500 transition-colors">
                  <Home className="h-4 w-4" />
                  Go to App
                </Link>
                <Link href="/dashboard" className="flex items-center gap-2 text-sm text-gray-400 hover:text-orange-500 transition-colors">
                  <User className="h-4 w-4" />
                  Dashboard
                </Link>
              </div>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-0 px-4 lg:px-8 xl:px-12 py-8 lg:py-12 max-w-none lg:max-w-4xl xl:max-w-5xl">
          {/* Hero Section */}
          <div className="mb-12 lg:mb-16">
            <div className="text-center lg:text-left mb-8">
              <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                Crism Documentation
              </h1>
              <p className="text-lg lg:text-xl text-gray-400 max-w-3xl mx-auto lg:mx-0">
                Your comprehensive guide to using Crism - the ultimate DeFi portfolio management platform on Citrea
              </p>
            </div>

            {/* Quick Start Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              <Card className="p-4 lg:p-6 bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20 hover:border-orange-500/40 transition-all duration-200 cursor-pointer group"
                    onClick={() => scrollToSection('getting-started')}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-orange-500/20 rounded-lg group-hover:bg-orange-500/30 transition-colors">
                    <Rocket className="h-5 w-5 text-orange-500" />
                  </div>
                  <h3 className="font-semibold text-lg">Quick Start</h3>
                </div>
                <p className="text-sm text-gray-400 mb-3">Get up and running with Crism in minutes</p>
                <div className="flex items-center text-orange-500 text-sm font-medium">
                  Start Now <ChevronRight className="h-4 w-4 ml-1" />
                </div>
              </Card>

              <Card className="p-4 lg:p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20 hover:border-blue-500/40 transition-all duration-200 cursor-pointer group"
                    onClick={() => scrollToSection('core-features')}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
                    <BarChart3 className="h-5 w-5 text-blue-500" />
                  </div>
                  <h3 className="font-semibold text-lg">Features</h3>
                </div>
                <p className="text-sm text-gray-400 mb-3">Explore all the powerful features available</p>
                <div className="flex items-center text-blue-500 text-sm font-medium">
                  Explore <ChevronRight className="h-4 w-4 ml-1" />
                </div>
              </Card>

              <Card className="p-4 lg:p-6 bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20 hover:border-purple-500/40 transition-all duration-200 cursor-pointer group"
                    onClick={() => scrollToSection('api-docs')}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 transition-colors">
                    <Code className="h-5 w-5 text-purple-500" />
                  </div>
                  <h3 className="font-semibold text-lg">API Docs</h3>
                </div>
                <p className="text-sm text-gray-400 mb-3">Integrate with Crism using our APIs</p>
                <div className="flex items-center text-purple-500 text-sm font-medium">
                  Integrate <ChevronRight className="h-4 w-4 ml-1" />
                </div>
              </Card>
            </div>
          </div>

          {/* Content Sections */}
          {/* Overview Section */}
          <section id="overview" className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <BookOpen className="h-6 w-6 lg:h-8 lg:w-8 text-orange-500" />
              <h2 className="text-2xl lg:text-3xl font-bold">Overview</h2>
            </div>
            <Card className="p-6 lg:p-8 bg-gray-900/50 border-orange-500/20">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl lg:text-2xl font-semibold mb-4 flex items-center gap-2">
                    <Target className="h-5 w-5 text-orange-500" />
                    What is Crism?
                  </h3>
                  <p className="text-base lg:text-lg text-gray-300 leading-relaxed mb-4">
                    <strong className="text-orange-500">CRISM</strong> is the first comprehensive portfolio management and DeFi tracking application built specifically for <strong>Citrea</strong>, Bitcoin's pioneering ZK rollup network. Our platform provides real-time insights into your digital assets, DeFi positions, and transaction history.
                  </p>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                    <div className="flex items-center gap-3 p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
                      <Star className="h-5 w-5 text-orange-500 flex-shrink-0" />
                      <span className="text-sm lg:text-base">First-to-Market on Citrea</span>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                      <Zap className="h-5 w-5 text-blue-500 flex-shrink-0" />
                      <span className="text-sm lg:text-base">Real-Time Portfolio Tracking</span>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                      <Shield className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm lg:text-base">Secure & Non-Custodial</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-700 pt-6">
                  <h4 className="text-lg font-semibold mb-3 text-orange-500">Key Features:</h4>
                  <ul className="space-y-2 text-gray-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>Real-time portfolio valuation and performance tracking</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>Comprehensive transaction history and analytics</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>DeFi protocol integration and yield tracking</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>NFT collection management (Prism system)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>Cross-chain bridge monitoring</span>
                    </li>
                  </ul>
                </div>
              </div>
            </Card>
          </section>

          {/* Getting Started Section */}
          <section id="getting-started" className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <Rocket className="h-6 w-6 lg:h-8 lg:w-8 text-orange-500" />
              <h2 className="text-2xl lg:text-3xl font-bold">Getting Started</h2>
            </div>
            
            <div className="space-y-6">
              {/* Installation Section */}
              <div id="installation">
                <Card className="p-6 lg:p-8 bg-gray-900/50 border-orange-500/20">
                  <h3 className="text-xl lg:text-2xl font-semibold mb-4 flex items-center gap-2">
                    <Settings className="h-5 w-5 text-orange-500" />
                    Installation & Setup
                  </h3>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold mb-3">1. Access the Application</h4>
                      <p className="text-gray-300 mb-3">
                        Crism is a web-based application. Simply navigate to our official URL:
                      </p>
                      <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 flex items-center justify-between">
                        <code className="text-orange-400 text-base lg:text-lg">https://crism.app</code>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard("https://crism.app", "URL")}
                          className="border-orange-500/20 text-orange-500 hover:bg-orange-500/10"
                        >
                          {copiedText === "URL" ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-semibold mb-3">2. Network Requirements</h4>
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <Lightbulb className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-semibold text-blue-400 mb-2">Citrea Testnet Setup Required</p>
                            <p className="text-sm text-gray-300">
                              Crism currently operates on Citrea Testnet. Make sure your wallet is configured for the testnet before connecting.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Wallet Setup Section */}
              <div id="wallet-setup">
                <Card className="p-6 lg:p-8 bg-gray-900/50 border-orange-500/20">
                  <h3 className="text-xl lg:text-2xl font-semibold mb-4 flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-orange-500" />
                    Wallet Setup
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                        <h4 className="font-semibold mb-2">Supported Wallets</h4>
                        <ul className="space-y-1 text-sm text-gray-300">
                          <li>• MetaMask</li>
                          <li>• WalletConnect</li>
                          <li>• Coinbase Wallet</li>
                          <li>• Other Web3 wallets</li>
                        </ul>
                      </div>
                      <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                        <h4 className="font-semibold mb-2">Network Details</h4>
                        <div className="space-y-1 text-sm text-gray-300">
                          <p><strong>Network:</strong> Citrea Testnet</p>
                          <p><strong>Chain ID:</strong> 5115</p>
                          <p><strong>RPC URL:</strong> https://rpc.testnet.citrea.xyz</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </section>

          {/* Core Features Section */}
          <section id="core-features" className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="h-6 w-6 lg:h-8 lg:w-8 text-orange-500" />
              <h2 className="text-2xl lg:text-3xl font-bold">Core Features</h2>
            </div>

            <div className="space-y-6">
              {/* Portfolio Dashboard */}
              <div id="portfolio-dashboard">
                <Card className="p-6 lg:p-8 bg-gray-900/50 border-orange-500/20">
                  <h3 className="text-xl lg:text-2xl font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-orange-500" />
                    Portfolio Dashboard
                  </h3>
                  <div className="space-y-4">
                    <p className="text-gray-300">
                      The portfolio dashboard is your central hub for tracking all your Citrea assets in real-time.
                    </p>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-orange-400">Real-Time Tracking</h4>
                        <ul className="text-sm text-gray-300 space-y-1">
                          <li>• Live portfolio valuation</li>
                          <li>• Asset allocation charts</li>
                          <li>• Performance metrics</li>
                          <li>• Historical data analysis</li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-semibold text-orange-400">Supported Assets</h4>
                        <ul className="text-sm text-gray-300 space-y-1">
                          <li>• Native CBTC</li>
                          <li>• ERC-20 tokens</li>
                          <li>• LP tokens</li>
                          <li>• NFTs and collectibles</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Marketplace */}
              <div id="marketplace">
                <Card className="p-6 lg:p-8 bg-gray-900/50 border-orange-500/20">
                  <h3 className="text-xl lg:text-2xl font-semibold mb-4 flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-orange-500" />
                    Marketplace
                  </h3>
                  <div className="space-y-4">
                    <p className="text-gray-300">
                      Discover and invest in the best DeFi protocols on Citrea through our integrated marketplace.
                    </p>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                        <h4 className="font-semibold mb-2 text-green-400">DeFi Protocols</h4>
                        <p className="text-sm text-gray-300">Browse verified DeFi protocols and yield farming opportunities</p>
                      </div>
                      <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                        <h4 className="font-semibold mb-2 text-blue-400">Liquidity Pools</h4>
                        <p className="text-sm text-gray-300">Find the best liquidity mining and staking rewards</p>
                      </div>
                      <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                        <h4 className="font-semibold mb-2 text-purple-400">NFT Collections</h4>
                        <p className="text-sm text-gray-300">Explore and trade NFTs in the Citrea ecosystem</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Prism NFT System */}
              <div id="prism-nft">
                <Card className="p-6 lg:p-8 bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
                  <h3 className="text-xl lg:text-2xl font-semibold mb-4 flex items-center gap-2">
                    <Gift className="h-5 w-5 text-purple-500" />
                    Prism NFT System
                  </h3>
                  <div className="space-y-4">
                    <p className="text-gray-300">
                      Exclusive NFT rewards system for Crism users, featuring unique benefits and utility.
                    </p>
                    <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-purple-400 mb-2">Coming Soon</p>
                          <p className="text-sm text-gray-300">
                            The Prism NFT system will be launched soon with exclusive rewards for early adopters and active users.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </section>

          {/* User Guide Section */}
          <section id="user-guide" className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="h-6 w-6 lg:h-8 lg:w-8 text-orange-500" />
              <h2 className="text-2xl lg:text-3xl font-bold">User Guide</h2>
            </div>

            <div className="space-y-6">
              {/* Navigation */}
              <div id="navigation">
                <Card className="p-6 lg:p-8 bg-gray-900/50 border-orange-500/20">
                  <h3 className="text-xl lg:text-2xl font-semibold mb-4 flex items-center gap-2">
                    <Search className="h-5 w-5 text-orange-500" />
                    Navigation
                  </h3>
                  <div className="space-y-4">
                    <p className="text-gray-300">
                      Crism features an intuitive navigation system designed for both beginners and advanced users.
                    </p>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <h4 className="font-semibold text-orange-400">Main Navigation</h4>
                        <ul className="text-sm text-gray-300 space-y-1">
                          <li><strong>Dashboard:</strong> Portfolio overview and metrics</li>
                          <li><strong>Marketplace:</strong> DeFi protocols and opportunities</li>
                          <li><strong>Transactions:</strong> History and analytics</li>
                          <li><strong>Settings:</strong> Account and preferences</li>
                        </ul>
                      </div>
                      <div className="space-y-3">
                        <h4 className="font-semibold text-orange-400">Quick Actions</h4>
                        <ul className="text-sm text-gray-300 space-y-1">
                          <li><strong>Connect Wallet:</strong> Link your Web3 wallet</li>
                          <li><strong>Switch Network:</strong> Change to Citrea testnet</li>
                          <li><strong>Refresh Data:</strong> Update portfolio information</li>
                          <li><strong>Export Data:</strong> Download transaction history</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Features Overview */}
              <div id="features-overview">
                <Card className="p-6 lg:p-8 bg-gray-900/50 border-orange-500/20">
                  <h3 className="text-xl lg:text-2xl font-semibold mb-4 flex items-center gap-2">
                    <Star className="h-5 w-5 text-orange-500" />
                    Features Overview
                  </h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
                      <TrendingUp className="h-6 w-6 text-orange-500 mb-2" />
                      <h4 className="font-semibold mb-2">Portfolio Tracking</h4>
                      <p className="text-sm text-gray-300">Real-time portfolio valuation and performance analytics</p>
                    </div>
                    <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                      <BarChart3 className="h-6 w-6 text-blue-500 mb-2" />
                      <h4 className="font-semibold mb-2">Analytics</h4>
                      <p className="text-sm text-gray-300">Comprehensive charts and performance metrics</p>
                    </div>
                    <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                      <Shield className="h-6 w-6 text-green-500 mb-2" />
                      <h4 className="font-semibold mb-2">Security</h4>
                      <p className="text-sm text-gray-300">Non-custodial and secure wallet integration</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </section>

          {/* API Documentation Section */}
          <section id="api-docs" className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <Code className="h-6 w-6 lg:h-8 lg:w-8 text-orange-500" />
              <h2 className="text-2xl lg:text-3xl font-bold">API Documentation</h2>
            </div>
            <Card className="p-6 lg:p-8 bg-gray-900/50 border-orange-500/20">
              <div className="space-y-6">
                <p className="text-gray-300">
                  Crism provides REST APIs for developers to integrate portfolio data and analytics into their applications.
                </p>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-orange-400">Available Endpoints</h3>
                  
                  <div className="space-y-3">
                     <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                     {/* <div className="flex items-center justify-between mb-2">
                        <code className="text-green-400">GET /api/citrea/balance</code>
                        <Badge variant="outline" className="border-green-500/20 text-green-500">Public</Badge>
                      </div>
                      <p className="text-sm text-gray-300">Get wallet balance and token holdings</p>
                    </div>
                    
                    <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                      <div className="flex items-center justify-between mb-2">
                        <code className="text-green-400">GET /api/citrea/portfolio</code>
                        <Badge variant="outline" className="border-green-500/20 text-green-500">Public</Badge>
                      </div>
                      <p className="text-sm text-gray-300">Get comprehensive portfolio data and analytics</p>
                    </div>
                    
                    <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                      <div className="flex items-center justify-between mb-2">
                        <code className="text-green-400">GET /api/citrea/transactions</code>
                        <Badge variant="outline" className="border-green-500/20 text-green-500">Public</Badge>
                      </div> */}
                      {/* <p className="text-sm text-gray-300">Get transaction history and details</p> */}
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-blue-400 mb-2">Rate Limiting</p>
                      <p className="text-sm text-gray-300">
                        API calls are rate limited to 100 requests per minute per IP address. Authentication will be required for higher limits.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </section>

          {/* Technical Architecture Section */}
          <section id="architecture" className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <Settings className="h-6 w-6 lg:h-8 lg:w-8 text-orange-500" />
              <h2 className="text-2xl lg:text-3xl font-bold">Technical Architecture</h2>
            </div>
            <Card className="p-6 lg:p-8 bg-gray-900/50 border-orange-500/20">
              <div className="space-y-6">
                <p className="text-gray-300">
                  Crism is built with modern web technologies and designed for scalability, security, and performance.
                </p>
                
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-orange-400">Frontend</h3>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li>• Next.js 14 with App Router</li>
                      <li>• TypeScript for type safety</li>
                      <li>• Tailwind CSS for styling</li>
                      <li>• React Query for data fetching</li>
                      <li>• Web3 wallet integration</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-orange-400">Backend & Data</h3>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li>• Node.js API endpoints</li>
                      <li>• Citrea RPC integration</li>
                      <li>• Real-time data synchronization</li>
                      <li>• GraphQL subgraph indexing</li>
                      <li>• Caching for performance</li>
                    </ul>
                  </div>
                </div>
                
                <div className="border-t border-gray-700 pt-6">
                  <h3 className="text-lg font-semibold mb-3 text-orange-400">Security & Privacy</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-200">Non-Custodial Design</h4>
                      <p className="text-sm text-gray-300">
                        Crism never holds or has access to user funds. All interactions are done through secure wallet connections.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-200">Data Privacy</h4>
                      <p className="text-sm text-gray-300">
                        Only on-chain public data is accessed. No personal information is collected or stored.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </section>

          {/* Troubleshooting Section */}
          <section id="troubleshooting" className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <AlertCircle className="h-6 w-6 lg:h-8 lg:w-8 text-orange-500" />
              <h2 className="text-2xl lg:text-3xl font-bold">Troubleshooting</h2>
            </div>
            <Card className="p-6 lg:p-8 bg-gray-900/50 border-orange-500/20">
              <div className="space-y-6">
                <p className="text-gray-300">
                  Common issues and their solutions when using Crism.
                </p>
                
                <div className="space-y-4">
                  <div className="border border-gray-700 rounded-lg p-4">
                    <h3 className="font-semibold text-orange-400 mb-2">Wallet Connection Issues</h3>
                    <div className="space-y-2 text-sm text-gray-300">
                      <p><strong>Problem:</strong> Wallet won't connect or shows wrong network</p>
                      <p><strong>Solution:</strong> Ensure you're connected to Citrea Testnet (Chain ID: 5115)</p>
                      <div className="bg-gray-800/50 p-3 rounded border border-gray-600 mt-2 space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-mono">Network: Citrea Testnet</p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard("Citrea Testnet", "Network")}
                            className="border-orange-500/20 text-orange-500 hover:bg-orange-500/10 h-6 w-6 p-0"
                          >
                            {copiedText === "Network" ? <CheckCircle className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                          </Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-mono">RPC URL: https://rpc.testnet.citrea.xyz</p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard("https://rpc.testnet.citrea.xyz", "RPC")}
                            className="border-orange-500/20 text-orange-500 hover:bg-orange-500/10 h-6 w-6 p-0"
                          >
                            {copiedText === "RPC" ? <CheckCircle className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                          </Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-mono">Chain ID: 5115</p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard("5115", "ChainID")}
                            className="border-orange-500/20 text-orange-500 hover:bg-orange-500/10 h-6 w-6 p-0"
                          >
                            {copiedText === "ChainID" ? <CheckCircle className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border border-gray-700 rounded-lg p-4">
                    <h3 className="font-semibold text-orange-400 mb-2">Portfolio Data Not Loading</h3>
                    <div className="space-y-2 text-sm text-gray-300">
                      <p><strong>Problem:</strong> Portfolio shows zero balance or outdated data</p>
                      <p><strong>Solution:</strong> Try refreshing the page or disconnecting and reconnecting your wallet</p>
                    </div>
                  </div>
                  
                  <div className="border border-gray-700 rounded-lg p-4">
                    <h3 className="font-semibold text-orange-400 mb-2">Transaction History Missing</h3>
                    <div className="space-y-2 text-sm text-gray-300">
                      <p><strong>Problem:</strong> Recent transactions not appearing</p>
                      <p><strong>Solution:</strong> Wait a few minutes for blockchain confirmation, then refresh</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </section>

          {/* FAQ Section */}
          <section id="faq" className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <HelpCircle className="h-6 w-6 lg:h-8 lg:w-8 text-orange-500" />
              <h2 className="text-2xl lg:text-3xl font-bold">Frequently Asked Questions</h2>
            </div>
            <div className="space-y-4">
              <Card className="p-6 lg:p-8 bg-gray-900/50 border-orange-500/20">
                <h3 className="text-lg font-semibold text-orange-400 mb-3">Is Crism free to use?</h3>
                <p className="text-gray-300">
                  Yes, Crism is completely free to use. There are no subscription fees or hidden costs for portfolio tracking and analytics.
                </p>
              </Card>
              
              <Card className="p-6 lg:p-8 bg-gray-900/50 border-orange-500/20">
                <h3 className="text-lg font-semibold text-orange-400 mb-3">What wallets are supported?</h3>
                <p className="text-gray-300">
                  Crism supports all major Web3 wallets including MetaMask, WalletConnect, Coinbase Wallet, and other EIP-1193 compatible wallets.
                </p>
              </Card>
              
              <Card className="p-6 lg:p-8 bg-gray-900/50 border-orange-500/20">
                <h3 className="text-lg font-semibold text-orange-400 mb-3">Is my data secure?</h3>
                <p className="text-gray-300">
                  Absolutely. Crism is non-custodial and only reads public blockchain data. We never have access to your private keys or funds.
                </p>
              </Card>
              
              <Card className="p-6 lg:p-8 bg-gray-900/50 border-orange-500/20">
                <h3 className="text-lg font-semibold text-orange-400 mb-3">When will mainnet support be available?</h3>
                <p className="text-gray-300">
                  Mainnet support will be available once Citrea launches its mainnet. We're currently operating on testnet to ensure stability and security.
                </p>
              </Card>
            </div>
          </section>

          {/* Footer Section */}
          <section className="mb-16">
            <Card className="p-6 lg:p-8 bg-gradient-to-br from-orange-500/20 to-orange-600/10 border-orange-500/30">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <LinkIcon className="h-5 w-5" />
                Important Links
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <a href="https://crism.app" className="flex items-center gap-2 text-orange-500 hover:text-orange-400 transition-colors">
                    <ExternalLink className="h-4 w-4" />
                    Application: crism.app
                  </a>
                  <a href="https://citrea.xyz" className="flex items-center gap-2 text-orange-500 hover:text-orange-400 transition-colors">
                    <ExternalLink className="h-4 w-4" />
                    Citrea Network: citrea.xyz
                  </a>
                </div>
                <div className="space-y-2">
                  <a href="https://explorer.testnet.citrea.xyz" className="flex items-center gap-2 text-orange-500 hover:text-orange-400 transition-colors">
                    <ExternalLink className="h-4 w-4" />
                    Explorer: explorer.testnet.citrea.xyz
                  </a>
                  <a href="mailto:support@crism.app" className="flex items-center gap-2 text-orange-500 hover:text-orange-400 transition-colors">
                    <ExternalLink className="h-4 w-4" />
                    Support: support@crism.app
                  </a>
                </div>
                <div className="space-y-2">
                  <a href="https://twitter.com/CrismApp" className="flex items-center gap-2 text-orange-500 hover:text-orange-400 transition-colors">
                    <ExternalLink className="h-4 w-4" />
                    Twitter: @CrismApp
                  </a>
                  <a href="https://github.com/crism-app" className="flex items-center gap-2 text-orange-500 hover:text-orange-400 transition-colors">
                    <ExternalLink className="h-4 w-4" />
                    GitHub: crism-app
                  </a>
                </div>
              </div>
            </Card>
          </section>

          {/* Legal & Disclaimers */}
          <section className="mb-16">
            <Card className="p-6 lg:p-8 bg-gray-900/50 border-orange-500/20">
              <h3 className="text-xl font-semibold mb-4">📄 Legal & Disclaimers</h3>
              <div className="space-y-3 text-gray-300 text-sm">
                <p><strong>Beta Software Notice:</strong> CRISM is currently in beta testing on Citrea testnet. Features and functionality may change.</p>
                <p><strong>No Financial Advice:</strong> CRISM provides portfolio tracking tools only. Nothing constitutes investment advice.</p>
                <p><strong>Testnet Only:</strong> Current version operates on Citrea testnet with test tokens only.</p>
                <div className="pt-4 border-t border-gray-700 text-xs text-gray-400">
                  <p>Last Updated: August 24, 2025 | Version: 1.0.0 | Network: Citrea Testnet</p>
                </div>
              </div>
            </Card>
          </section>
        </main>
      </div>
    </div>
  )
}
