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
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
