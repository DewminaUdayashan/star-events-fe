import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Ticket, Calendar, Users, BarChart3, Shield, Headphones, CreditCard, QrCode, ArrowRight } from "lucide-react"

const customerServices = [
  {
    icon: Ticket,
    title: "Easy Ticket Booking",
    description: "Browse, select, and book tickets for your favorite events in just a few clicks",
    features: ["Instant confirmation", "Mobile tickets", "Secure payment"],
  },
  {
    icon: QrCode,
    title: "Digital Tickets",
    description: "Get QR-coded e-tickets delivered instantly to your email and mobile app",
    features: ["QR code entry", "Offline access", "Easy sharing"],
  },
  {
    icon: CreditCard,
    title: "Secure Payments",
    description: "Multiple payment options with bank-level security for your peace of mind",
    features: ["Credit/Debit cards", "Online banking", "Mobile wallets"],
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Round-the-clock customer support to help you with any questions or issues",
    features: ["Live chat", "Phone support", "Email assistance"],
  },
]

const organizerServices = [
  {
    icon: Calendar,
    title: "Event Management",
    description: "Complete event creation and management tools for organizers",
    features: ["Event creation", "Ticket types", "Venue management"],
  },
  {
    icon: BarChart3,
    title: "Analytics & Reports",
    description: "Detailed insights and analytics to track your event performance",
    features: ["Sales reports", "Audience insights", "Revenue tracking"],
  },
  {
    icon: Users,
    title: "Audience Engagement",
    description: "Tools to connect with your audience and build lasting relationships",
    features: ["Email marketing", "Social sharing", "Feedback collection"],
  },
  {
    icon: Shield,
    title: "Fraud Protection",
    description: "Advanced security measures to protect against fraudulent activities",
    features: ["Secure transactions", "Identity verification", "Chargeback protection"],
  },
]

export default function ServicesSection() {
  return (
    <section className="py-16 bg-gray-800">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Everything You Need for Events</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Whether you're attending events or organizing them, we provide comprehensive solutions to make your
            experience seamless and successful.
          </p>
        </div>

        {/* Customer Services */}
        <div className="mb-16">
          <div className="flex items-center justify-center mb-8">
            <Badge className="bg-blue-600 hover:bg-blue-700">For Event Attendees</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {customerServices.map((service, index) => (
              <Card
                key={index}
                className="bg-gray-900 border-gray-700 hover:border-blue-500 transition-colors group h-full"
              >
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mb-4">
                    <service.icon className="h-6 w-6 text-blue-400" />
                  </div>

                  <h3 className="text-white font-semibold mb-2 group-hover:text-blue-400 transition-colors">
                    {service.title}
                  </h3>

                  <p className="text-gray-400 text-sm mb-4">{service.description}</p>

                  <ul className="space-y-1">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="text-gray-500 text-xs flex items-center">
                        <div className="w-1 h-1 bg-blue-400 rounded-full mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Link href="/events">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Start Browsing Events
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Organizer Services */}
        <div>
          <div className="flex items-center justify-center mb-8">
            <Badge className="bg-purple-600 hover:bg-purple-700">For Event Organizers</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {organizerServices.map((service, index) => (
              <Card
                key={index}
                className="bg-gray-900 border-gray-700 hover:border-purple-500 transition-colors group h-full"
              >
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center mb-4">
                    <service.icon className="h-6 w-6 text-purple-400" />
                  </div>

                  <h3 className="text-white font-semibold mb-2 group-hover:text-purple-400 transition-colors">
                    {service.title}
                  </h3>

                  <p className="text-gray-400 text-sm mb-4">{service.description}</p>

                  <ul className="space-y-1">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="text-gray-500 text-xs flex items-center">
                        <div className="w-1 h-1 bg-purple-400 rounded-full mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Link href="/organizer/register">
              <Button className="bg-purple-600 hover:bg-purple-700">
                Become an Organizer
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Call to Action */}
        <Card className="mt-16 bg-gradient-to-r from-blue-900 to-purple-900 border-blue-500">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Ready to Get Started?</h3>
            <p className="text-blue-200 mb-6 max-w-2xl mx-auto">
              Join thousands of satisfied customers and organizers who trust StarEvents for their event needs.
              Experience the difference today!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="bg-white text-blue-900 hover:bg-gray-100">
                  Sign Up Now
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-blue-900 bg-transparent"
                >
                  Contact Sales
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
