import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Users, Shield, Zap, Heart } from "lucide-react"

const features = [
  {
    icon: Users,
    title: "Community Focused",
    description: "Connecting event organizers with passionate audiences across Sri Lanka",
  },
  {
    icon: Shield,
    title: "Secure & Reliable",
    description: "Safe payment processing and guaranteed ticket authenticity",
  },
  {
    icon: Zap,
    title: "Easy Booking",
    description: "Simple, fast booking process with instant confirmation",
  },
  {
    icon: Heart,
    title: "Local Culture",
    description: "Celebrating and promoting Sri Lankan arts, culture, and entertainment",
  },
]

const achievements = [
  "Leading event platform in Sri Lanka",
  "Trusted by 1000+ event organizers",
  "Supporting local artists and venues",
  "Award-winning customer service",
]

export default function AboutSection() {
  return (
    <section className="py-16 bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content Side */}
          <div>
            <Badge className="mb-4 bg-purple-600 hover:bg-purple-700">About StarEvents</Badge>

            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Bringing Sri Lanka's Best Events to Your Fingertips
            </h2>

            <p className="text-gray-400 text-lg mb-8 text-pretty">
              StarEvents is Sri Lanka's premier event ticketing platform, dedicated to connecting event enthusiasts with
              unforgettable experiences. From traditional cultural performances to modern concerts, we make discovering
              and attending events simple, secure, and enjoyable.
            </p>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
                    <feature.icon className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">{feature.title}</h3>
                    <p className="text-gray-400 text-sm">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Achievements */}
            <div className="mb-8">
              <h3 className="text-white font-semibold mb-4">Why Choose StarEvents?</h3>
              <div className="space-y-2">
                {achievements.map((achievement, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <span className="text-gray-300">{achievement}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/about">
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                  Learn More About Us
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-purple-500 text-purple-400 hover:bg-purple-600 hover:text-white bg-transparent"
                >
                  Get in Touch
                </Button>
              </Link>
            </div>
          </div>

          {/* Visual Side */}
          <div className="relative">
            {/* Main Image */}
            <Card className="bg-gray-800 border-gray-700 overflow-hidden">
              <div className="relative h-80">
                <Image src="/diverse-group-enjoying-cultural-event-concert.jpg" alt="People enjoying events" fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />

                {/* Floating Stats */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="grid grid-cols-3 gap-4">
                    <Card className="bg-white/10 backdrop-blur border-white/20">
                      <CardContent className="p-3 text-center">
                        <div className="text-white font-bold text-lg">50K+</div>
                        <div className="text-white/80 text-xs">Happy Users</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-white/10 backdrop-blur border-white/20">
                      <CardContent className="p-3 text-center">
                        <div className="text-white font-bold text-lg">2.5K+</div>
                        <div className="text-white/80 text-xs">Events</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-white/10 backdrop-blur border-white/20">
                      <CardContent className="p-3 text-center">
                        <div className="text-white font-bold text-lg">25+</div>
                        <div className="text-white/80 text-xs">Cities</div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </Card>

            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-purple-600/20 rounded-full blur-xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-blue-600/20 rounded-full blur-xl" />
          </div>
        </div>
      </div>
    </section>
  )
}
