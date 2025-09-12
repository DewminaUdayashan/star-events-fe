"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Calendar, MapPin, Users } from "lucide-react"

interface HeroSlide {
  id: string
  title: string
  subtitle: string
  description: string
  image: string
  ctaText: string
  ctaLink: string
  badge?: string
  stats?: {
    date: string
    location: string
    attendees: string
  }
}

const heroSlides: HeroSlide[] = [
  {
    id: "1",
    title: "Symphony Under the Stars",
    subtitle: "Classical Music Experience",
    description:
      "Join us for an enchanting evening of classical music with the National Symphony Orchestra under the open sky.",
    image: "assets/hero-concert.jpg",
    ctaText: "Book Now",
    ctaLink: "/events/1",
    badge: "Featured Event",
    stats: {
      date: "Dec 15, 2024",
      location: "Nelum Pokuna Theatre",
      attendees: "300+ Expected",
    },
  },
  {
    id: "2",
    title: "Cultural Heritage Festival",
    subtitle: "Traditional Arts & Dance",
    description: "Immerse yourself in Sri Lankan culture with traditional dance performances and cultural exhibitions.",
    image: "assets/hero-cultural.jpg",
    ctaText: "Explore Events",
    ctaLink: "/events?category=cultural",
    badge: "This Weekend",
    stats: {
      date: "Dec 18, 2024",
      location: "Temple of the Tooth",
      attendees: "500+ Expected",
    },
  },
  {
    id: "3",
    title: "Theatre Spectacular",
    subtitle: "Drama & Performance",
    description: "Experience world-class theatrical performances by renowned local and international artists.",
    image: "assets/hero-theatre.jpg",
    ctaText: "View Shows",
    ctaLink: "/events?category=theatre",
    badge: "Limited Seats",
    stats: {
      date: "Dec 22, 2024",
      location: "Lionel Wendt Theatre",
      attendees: "200+ Expected",
    },
  },
]

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    setIsAutoPlaying(false)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)
    setIsAutoPlaying(false)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
    setIsAutoPlaying(false)
  }

  return (
    <div className="relative h-[600px] lg:h-[700px] overflow-hidden bg-gray-900">
      {/* Slides */}
      {heroSlides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src={slide.image || "/placeholder.svg"}
              alt={slide.title}
              fill
              className="object-cover"
              priority={index === 0}
            />
            <div className="absolute inset-0 bg-black/50" />
          </div>

          {/* Content */}
          <div className="relative h-full flex items-center">
            <div className="container mx-auto px-4">
              <div className="max-w-2xl">
                {slide.badge && <Badge className="mb-4 bg-purple-600 hover:bg-purple-700">{slide.badge}</Badge>}

                <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4 text-balance">{slide.title}</h1>

                <p className="text-xl lg:text-2xl text-purple-200 mb-6">{slide.subtitle}</p>

                <p className="text-lg text-gray-300 mb-8 text-pretty">{slide.description}</p>

                {/* Stats */}
                {slide.stats && (
                  <div className="flex flex-wrap gap-6 mb-8">
                    <div className="flex items-center text-gray-300">
                      <Calendar className="h-5 w-5 mr-2" />
                      <span>{slide.stats.date}</span>
                    </div>
                    <div className="flex items-center text-gray-300">
                      <MapPin className="h-5 w-5 mr-2" />
                      <span>{slide.stats.location}</span>
                    </div>
                    <div className="flex items-center text-gray-300">
                      <Users className="h-5 w-5 mr-2" />
                      <span>{slide.stats.attendees}</span>
                    </div>
                  </div>
                )}

                <Link href={slide.ctaLink}>
                  <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white">
                    {slide.ctaText}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-colors ${index === currentSlide ? "bg-white" : "bg-white/50"}`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
