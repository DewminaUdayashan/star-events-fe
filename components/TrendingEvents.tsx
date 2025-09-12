import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Users, TrendingUp } from "lucide-react"
import { getTrendingEvents } from "@/data/mockEvents"

export default function TrendingEvents() {
  const trendingEvents = getTrendingEvents()

  return (
    <section className="py-16 bg-gray-900">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <TrendingUp className="h-6 w-6 text-purple-500 mr-2" />
            <Badge variant="outline" className="border-purple-500 text-purple-400">
              Hot Right Now
            </Badge>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Trending Events</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Don't miss out on the most popular events happening right now. These are the hottest tickets in town!
          </p>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {trendingEvents.map((event) => (
            <Card
              key={event.id}
              className="bg-gray-800 border-gray-700 overflow-hidden hover:border-purple-500 transition-colors group"
            >
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={event.image || "/placeholder.svg"}
                  alt={event.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-red-600 hover:bg-red-700">Trending</Badge>
                </div>
                {event.discount && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-green-600 hover:bg-green-700">{event.discount}% OFF</Badge>
                  </div>
                )}
              </div>

              <CardContent className="p-6">
                <div className="mb-4">
                  <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-purple-400 transition-colors">
                    {event.title}
                  </h3>
                  <p className="text-gray-400 text-sm line-clamp-2">{event.shortDescription}</p>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-400 text-sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>
                      {new Date(event.date).toLocaleDateString()} at {event.time}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-400 text-sm">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>
                      {event.venue}, {event.location}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-400 text-sm">
                    <Users className="h-4 w-4 mr-2" />
                    <span>{event.ticketsAvailable} tickets available</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {event.originalPrice && (
                      <span className="text-gray-500 line-through text-sm">
                        Rs. {event.originalPrice.toLocaleString()}
                      </span>
                    )}
                    <span className="text-white font-semibold text-lg">Rs. {event.price.toLocaleString()}</span>
                  </div>
                  <Link href={`/events/${event.id}`}>
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                      View Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Link href="/events?trending=true">
            <Button
              variant="outline"
              size="lg"
              className="border-purple-500 text-purple-400 hover:bg-purple-600 hover:text-white bg-transparent"
            >
              View All Trending Events
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
