import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight } from "lucide-react"
import { eventCategories } from "@/data/mockEvents"

export default function EventCategories() {
  return (
    <section className="py-16 bg-gray-800">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Explore Event Categories</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Discover events that match your interests. From music concerts to cultural shows, find exactly what you're
            looking for.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {eventCategories.map((category) => (
            <Link key={category.id} href={`/events?category=${category.slug}`}>
              <Card className="bg-gray-900 border-gray-700 hover:border-purple-500 transition-all duration-300 group cursor-pointer h-full">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-lg ${category.color} flex items-center justify-center text-2xl`}>
                      {category.icon}
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-purple-400 transition-colors" />
                  </div>

                  <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-purple-400 transition-colors">
                    {category.name}
                  </h3>

                  <p className="text-gray-400 text-sm mb-4">{category.description}</p>

                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="border-gray-600 text-gray-400">
                      {category.eventCount} events
                    </Badge>
                    <span className="text-purple-400 text-sm font-medium group-hover:underline">Explore →</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
