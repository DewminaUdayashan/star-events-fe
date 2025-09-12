"use client"

import { useState, useMemo, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, MapPin, Users, Search, Filter, TrendingUp, Loader2 } from "lucide-react"
import { eventsService } from "@/lib/services"
import type { Event, EventFilters } from "@/lib/types/api"

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedLocation, setSelectedLocation] = useState("all")
  const [sortBy, setSortBy] = useState("date")

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true)
        const filters: EventFilters = {}

        if (searchQuery) filters.keyword = searchQuery
        if (selectedCategory !== "all") filters.category = selectedCategory
        if (selectedLocation !== "all") filters.venue = selectedLocation

        const fetchedEvents = await eventsService.getEvents(filters)
        setEvents(fetchedEvents)
      } catch (err) {
        setError("Failed to load events")
        console.error("Error fetching events:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [searchQuery, selectedCategory, selectedLocation])

  // Get unique locations and categories from events
  const locations = useMemo(() => {
    const uniqueLocations = [...new Set(events.map((event) => event.venue?.location).filter(Boolean))]
    return uniqueLocations
  }, [events])

  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(events.map((event) => event.category).filter(Boolean))]
    return uniqueCategories
  }, [events])

  // Sort events
  const sortedEvents = useMemo(() => {
    const eventsCopy = [...events]

    switch (sortBy) {
      case "date":
        eventsCopy.sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
        break
      case "price-low":
        eventsCopy.sort((a, b) => {
          const aPrice = a.prices?.[0]?.price || 0
          const bPrice = b.prices?.[0]?.price || 0
          return aPrice - bPrice
        })
        break
      case "price-high":
        eventsCopy.sort((a, b) => {
          const aPrice = a.prices?.[0]?.price || 0
          const bPrice = b.prices?.[0]?.price || 0
          return bPrice - aPrice
        })
        break
      case "popularity":
        eventsCopy.sort((a, b) => (b.isPublished ? 1 : 0) - (a.isPublished ? 1 : 0))
        break
    }

    return eventsCopy
  }, [events, sortBy])

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4">Discover Events</h1>
          <p className="text-gray-400 max-w-2xl">
            Find amazing events happening around Sri Lanka. From concerts to cultural shows, discover your next
            unforgettable experience.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="bg-gray-800 rounded-3xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search Input */}
            <div className="lg:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400 rounded-2xl"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white rounded-2xl">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600 rounded-2xl">
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Location Filter */}
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white rounded-2xl">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600 rounded-2xl">
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort By */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white rounded-2xl">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600 rounded-2xl">
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="popularity">Popularity</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <span className="text-gray-400">
              {loading ? "Loading..." : `${sortedEvents.length} event${sortedEvents.length !== 1 ? "s" : ""} found`}
            </span>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
            <span className="ml-2 text-gray-400">Loading events...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="text-red-400 mb-4">
              <h3 className="text-xl font-semibold mb-2">Error Loading Events</h3>
              <p>{error}</p>
            </div>
            <Button onClick={() => window.location.reload()} className="bg-purple-600 hover:bg-purple-700 rounded-2xl">
              Try Again
            </Button>
          </div>
        )}

        {/* Events Grid */}
        {!loading && !error && sortedEvents.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedEvents.map((event) => (
              <Card
                key={event.id}
                className="bg-gray-800 border-gray-700 overflow-hidden hover:border-purple-500 transition-colors group rounded-3xl"
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={event.image || "/placeholder.svg?height=200&width=400&query=event"}
                    alt={event.title || "Event"}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4 flex space-x-2">
                    {event.isPublished && (
                      <Badge className="bg-green-600 hover:bg-green-700 flex items-center rounded-2xl">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Published
                      </Badge>
                    )}
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-purple-400 transition-colors">
                      {event.title}
                    </h3>
                    <p className="text-gray-400 text-sm line-clamp-2">{event.description}</p>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-400 text-sm">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>
                        {new Date(event.eventDate).toLocaleDateString()} at{" "}
                        {new Date(event.eventTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-400 text-sm">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>
                        {event.venue?.name}, {event.venue?.location}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-400 text-sm">
                      <Users className="h-4 w-4 mr-2" />
                      <span>{event.venue?.capacity} capacity</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-semibold text-lg">
                        {event.prices?.[0] ? `Rs. ${event.prices[0].price.toLocaleString()}` : "Free"}
                      </span>
                    </div>
                    <Link href={`/events/${event.id}`}>
                      <Button size="sm" className="bg-purple-600 hover:bg-purple-700 rounded-2xl">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* No Events Found */}
        {!loading && !error && sortedEvents.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No events found</h3>
              <p>Try adjusting your search criteria or browse all events.</p>
            </div>
            <Button
              onClick={() => {
                setSearchQuery("")
                setSelectedCategory("all")
                setSelectedLocation("all")
              }}
              variant="outline"
              className="border-purple-500 text-purple-400 hover:bg-purple-600 hover:text-white rounded-2xl"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
