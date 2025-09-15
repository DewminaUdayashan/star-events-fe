"use client";

import { Suspense } from "react";
import { getImageUrl } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, TrendingUp, ArrowLeft } from "lucide-react";
import { getEventsByCategory, eventCategories } from "@/data/mockEvents";

export default function CategoryEventsPage() {
  const params = useParams();
  const categorySlug = params.slug as string;

  const category = eventCategories.find((c) => c.slug === categorySlug);
  const events = getEventsByCategory(categorySlug);

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">
            Category Not Found
          </h1>
          <p className="text-gray-400 mb-6">
            The category you're looking for doesn't exist.
          </p>
          <Link href="/events">
            <Button className="bg-purple-600 hover:bg-purple-700">
              Browse All Events
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Back Button */}
      <div className="container mx-auto px-4 py-4">
        <Link href="/events">
          <Button variant="ghost" className="text-gray-400 hover:text-white">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Button>
        </Link>
      </div>

      {/* Category Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center space-x-4 mb-6">
            <div
              className={`w-16 h-16 rounded-lg ${category.color} flex items-center justify-center text-3xl`}
            >
              {category.icon}
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                {category.name}
              </h1>
              <p className="text-gray-400 text-lg">{category.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Badge
              variant="outline"
              className="border-purple-500 text-purple-400"
            >
              {events.length} event{events.length !== 1 ? "s" : ""} available
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Card
                key={event.id}
                className="bg-gray-800 border-gray-700 overflow-hidden hover:border-purple-500 transition-colors group"
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={getImageUrl(event.imageUrl || event.image)}
                    alt={event.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4 flex space-x-2">
                    {event.trending && (
                      <Badge className="bg-red-600 hover:bg-red-700 flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Trending
                      </Badge>
                    )}
                    {event.featured && (
                      <Badge className="bg-yellow-600 hover:bg-yellow-700">
                        Featured
                      </Badge>
                    )}
                  </div>
                  {event.discount && (
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-green-600 hover:bg-green-700">
                        {event.discount}% OFF
                      </Badge>
                    </div>
                  )}
                </div>

                <CardContent className="p-6">
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-purple-400 transition-colors">
                      {event.title}
                    </h3>
                    <p className="text-gray-400 text-sm line-clamp-2">
                      {event.shortDescription}
                    </p>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-400 text-sm">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>
                        {new Date(event.date).toLocaleDateString()} at{" "}
                        {event.time}
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
                      <span className="text-white font-semibold text-lg">
                        Rs. {event.price.toLocaleString()}
                      </span>
                    </div>
                    <Link href={`/events/${event.id}`}>
                      <Button
                        size="sm"
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        View Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <div
                className={`w-16 h-16 rounded-lg ${category.color} flex items-center justify-center text-3xl mx-auto mb-4`}
              >
                {category.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">
                No events in this category yet
              </h3>
              <p>
                Check back later for new {category.name.toLowerCase()} events.
              </p>
            </div>
            <Link href="/events">
              <Button
                variant="outline"
                className="border-purple-500 text-purple-400 hover:bg-purple-600 hover:text-white bg-transparent"
              >
                Browse All Events
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
