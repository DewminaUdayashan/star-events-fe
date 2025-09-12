import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Users, Calendar, MapPin, Star } from "lucide-react"

const stats = [
  {
    id: "1",
    title: "Happy Customers",
    value: "50,000+",
    description: "Satisfied event-goers",
    icon: Users,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
  },
  {
    id: "2",
    title: "Events Hosted",
    value: "2,500+",
    description: "Successful events organized",
    icon: Calendar,
    color: "text-green-400",
    bgColor: "bg-green-500/10",
  },
  {
    id: "3",
    title: "Cities Covered",
    value: "25+",
    description: "Across Sri Lanka",
    icon: MapPin,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
  },
  {
    id: "4",
    title: "Average Rating",
    value: "4.8/5",
    description: "Customer satisfaction",
    icon: Star,
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/10",
  },
]

export default function QuickStats() {
  return (
    <section className="py-16 bg-gray-800">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Trusted by Thousands</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Join the growing community of event enthusiasts who trust StarEvents for their entertainment needs.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Card key={stat.id} className="bg-gray-900 border-gray-700 hover:border-purple-500 transition-colors group">
              <CardContent className="p-6 text-center">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full ${stat.bgColor} flex items-center justify-center`}>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>

                <h3 className="text-3xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                  {stat.value}
                </h3>

                <p className="text-lg font-semibold text-gray-300 mb-1">{stat.title}</p>

                <p className="text-sm text-gray-400">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <p className="text-gray-400 mb-4">Ready to discover amazing events?</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/events">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                Browse Events
              </Button>
            </Link>
            <Link href="/organizer/register">
              <Button
                size="lg"
                variant="outline"
                className="border-purple-500 text-purple-400 hover:bg-purple-600 hover:text-white bg-transparent"
              >
                Become an Organizer
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
