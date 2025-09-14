"use client";
import { Navigation } from "@/components/layout/Navigation"
import Footer from "@/components/Footer"
import HeroCarousel from "@/components/HeroCarousel"
import SearchAndFilter from "@/components/SearchAndFilter"
import TrendingEvents from "@/components/TrendingEvents"
import EventCategories from "@/components/EventCategories"
import PromotionsSection from "@/components/PromotionsSection"
import QuickStats from "@/components/QuickStats"
import AboutSection from "@/components/AboutSection"
import ServicesSection from "@/components/ServicesSection"
import { useAuth } from "@/contexts/AuthContext"
import { useCart } from "@/contexts/CartContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, ArrowRight, Shield, Database, Key } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const { user } = useAuth()
  const { items: cartItems } = useCart()

  const handleSearch = (query: string, filters: any) => {
    // In a real app, this would trigger search functionality
    console.log("Search:", query, filters)
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <HeroCarousel />

        {/* Search and Filter Section */}
        <section className="py-8 bg-gray-800">
          <div className="container mx-auto px-4">
            <SearchAndFilter onSearch={handleSearch} />
          </div>
        </section>

        {/* Trending Events */}
        <TrendingEvents />

        {/* Event Categories */}
        <EventCategories />

        {/* Promotions Section */}
        <PromotionsSection />

        {/* Quick Stats */}
        <QuickStats />

        {/* About Section */}
        <AboutSection />

        {/* Services Section */}
        <ServicesSection />

        {/* Authentication Demo Section */}
        <section className="py-16 bg-gray-800">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">
                Complete Authentication System
              </h2>
              <p className="text-gray-400 text-lg">
                React/Next.js frontend integrated with ASP.NET Core Identity backend
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
              <Card className="bg-gray-900 border-gray-700">
                <CardContent className="p-6 text-center">
                  <Shield className="h-8 w-8 text-green-500 mx-auto mb-3" />
                  <h3 className="text-white font-semibold mb-2">Registration</h3>
                  <p className="text-gray-400 text-sm">Complete form with validation</p>
                </CardContent>
              </Card>
              <Card className="bg-gray-900 border-gray-700">
                <CardContent className="p-6 text-center">
                  <Key className="h-8 w-8 text-blue-500 mx-auto mb-3" />
                  <h3 className="text-white font-semibold mb-2">Login</h3>
                  <p className="text-gray-400 text-sm">Secure authentication</p>
                </CardContent>
              </Card>
              <Card className="bg-gray-900 border-gray-700">
                <CardContent className="p-6 text-center">
                  <Database className="h-8 w-8 text-purple-500 mx-auto mb-3" />
                  <h3 className="text-white font-semibold mb-2">Token Storage</h3>
                  <p className="text-gray-400 text-sm">localStorage persistence</p>
                </CardContent>
              </Card>
              <Card className="bg-gray-900 border-gray-700">
                <CardContent className="p-6 text-center">
                  <CheckCircle className="h-8 w-8 text-orange-500 mx-auto mb-3" />
                  <h3 className="text-white font-semibold mb-2">Auto-Login</h3>
                  <p className="text-gray-400 text-sm">Seamless experience</p>
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center space-x-2 bg-gray-900 px-4 py-2 rounded-full mb-6">
                {user ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-white">Authenticated as {user.fullName || user.email}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-400">Not authenticated</span>
                  </>
                )}
              </div>
              
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/demo">
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    View Demo
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/auth-test">
                  <Button variant="outline">
                    Test Auth System
                  </Button>
                </Link>
                {!user ? (
                  <>
                    <Link href="/register">
                      <Button variant="outline">
                        Register
                      </Button>
                    </Link>
                    <Link href="/login">
                      <Button variant="outline">
                        Login
                      </Button>
                    </Link>
                  </>
                ) : (
                  <Link href="/profile">
                    <Button variant="outline">
                      View Profile
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
