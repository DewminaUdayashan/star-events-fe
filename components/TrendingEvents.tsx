"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, MapPin, Users, TrendingUp } from "lucide-react";
import { useEvents } from "@/lib/services";
import { getImageUrl } from "@/lib/utils";

export default function TrendingEvents() {
  // Fetch upcoming events
  const { data: events, isLoading, error } = useEvents({});

  // Filter and sort events to show trending/featured ones
  const trendingEvents = useMemo(() => {
    console.log("TrendingEvents - Raw events data:", events);
    console.log("TrendingEvents - Is events array?", Array.isArray(events));

    if (!events) return [];

    // Handle different possible API response structures
    let eventsArray = events;
    const eventsData = events as any; // Cast to any for debugging

    // If events is an object with a data property (common API pattern)
    if (
      typeof eventsData === "object" &&
      !Array.isArray(eventsData) &&
      eventsData.data
    ) {
      eventsArray = eventsData.data;
    }

    // If events is an object with a $values property (.NET API pattern)
    if (
      typeof eventsData === "object" &&
      !Array.isArray(eventsData) &&
      eventsData.$values
    ) {
      eventsArray = eventsData.$values;
    }

    console.log("TrendingEvents - Final events array:", eventsArray);

    if (!Array.isArray(eventsArray)) {
      console.warn(
        "TrendingEvents - eventsArray is not an array:",
        eventsArray
      );
      return [];
    }

    return eventsArray
      .filter((event: any) => event.isPublished)
      .sort((a: any, b: any) => {
        // Prioritize featured events, then sort by date
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return (
          new Date(a.eventDate || a.date).getTime() -
          new Date(b.eventDate || b.date).getTime()
        );
      })
      .slice(0, 6); // Take first 6 events
  }, [events]);

  if (error) {
    return (
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-4 text-center">
          <p className="text-red-400">Failed to load trending events</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-900">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <TrendingUp className="h-6 w-6 text-purple-500 mr-2" />
            <Badge
              variant="outline"
              className="border-purple-500 text-purple-400"
            >
              Hot Right Now
            </Badge>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Trending Events
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Don't miss out on the most popular events happening right now. These
            are the hottest tickets in town!
          </p>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 6 }).map((_, index) => (
              <Card
                key={index}
                className="bg-gray-800 border-gray-700 overflow-hidden"
              >
                <Skeleton className="h-48 w-full bg-gray-700" />
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-2 bg-gray-700" />
                  <Skeleton className="h-4 w-full mb-4 bg-gray-700" />
                  <Skeleton className="h-4 w-2/3 mb-2 bg-gray-700" />
                  <Skeleton className="h-4 w-1/2 mb-4 bg-gray-700" />
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-6 w-20 bg-gray-700" />
                    <Skeleton className="h-8 w-24 bg-gray-700" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : trendingEvents.length > 0 ? (
            trendingEvents.map((event: any) => (
              <Card
                key={event.id}
                className="bg-gray-800 border-gray-700 overflow-hidden hover:border-purple-500 transition-colors group"
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={getImageUrl(event.imageUrl || event.image)}
                    alt={event.title || "Event"}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-red-600 hover:bg-red-700">
                      Trending
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-purple-400 transition-colors">
                      {event.title}
                    </h3>
                    <p className="text-gray-400 text-sm line-clamp-2">
                      {event.description?.substring(0, 100)}...
                    </p>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-400 text-sm">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>
                        {new Date(event.eventDate).toLocaleDateString()} at{" "}
                        {event.eventTime}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-400 text-sm">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{event.venue?.name || "Venue TBD"}</span>
                    </div>
                    {event.prices && event.prices.length > 0 && (
                      <div className="flex items-center text-gray-400 text-sm">
                        <Users className="h-4 w-4 mr-2" />
                        <span>{event.prices[0].stock} tickets available</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {event.prices && event.prices.length > 0 && (
                        <span className="text-white font-semibold text-lg">
                          Rs. {event.prices[0].price.toLocaleString()}
                        </span>
                      )}
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
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-400">
                No trending events available at the moment.
              </p>
            </div>
          )}
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
  );
}
