import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Percent, Gift, Clock, Star } from "lucide-react"

const promotions = [
  {
    id: "1",
    title: "Early Bird Special",
    description: "Book your tickets 2 weeks in advance and save up to 25% on all events",
    discount: "25% OFF",
    code: "EARLY25",
    validUntil: "Dec 31, 2024",
    image: "/early-bird-discount-promotion.jpg",
    type: "discount",
    color: "bg-green-600",
  },
  {
    id: "2",
    title: "Student Discount",
    description: "Valid student ID holders get exclusive discounts on cultural and educational events",
    discount: "20% OFF",
    code: "STUDENT20",
    validUntil: "Ongoing",
    image: "/student-discount-education.jpg",
    type: "student",
    color: "bg-blue-600",
  },
  {
    id: "3",
    title: "Group Booking Offer",
    description: "Book 5 or more tickets together and unlock special group pricing",
    discount: "15% OFF",
    code: "GROUP15",
    validUntil: "Limited Time",
    image: "/group-booking-friends-together.jpg",
    type: "group",
    color: "bg-purple-600",
  },
  {
    id: "4",
    title: "Loyalty Rewards",
    description: "Earn points with every booking and redeem them for free tickets and exclusive perks",
    discount: "Earn Points",
    code: "LOYALTY",
    validUntil: "Ongoing",
    image: "/loyalty-rewards-program.jpg",
    type: "loyalty",
    color: "bg-orange-600",
  },
]

export default function PromotionsSection() {
  return (
    <section className="py-16 bg-gray-900">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Percent className="h-6 w-6 text-green-500 mr-2" />
            <Badge variant="outline" className="border-green-500 text-green-400">
              Special Offers
            </Badge>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">Exclusive Promotions & Discounts</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Save more on your favorite events with our special offers and loyalty programs. Don't miss out on these
            limited-time deals!
          </p>
        </div>

        {/* Promotions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {promotions.map((promo) => (
            <Card
              key={promo.id}
              className="bg-gray-800 border-gray-700 overflow-hidden hover:border-green-500 transition-colors group"
            >
              <div className="md:flex">
                <div className="md:w-1/3 relative h-48 md:h-auto">
                  <Image src={promo.image || "/placeholder.svg"} alt={promo.title} fill className="object-cover" />
                  <div className="absolute top-4 left-4">
                    <Badge className={`${promo.color} text-white`}>{promo.discount}</Badge>
                  </div>
                </div>

                <CardContent className="md:w-2/3 p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-semibold text-white group-hover:text-green-400 transition-colors">
                      {promo.title}
                    </h3>
                    {promo.type === "loyalty" ? (
                      <Star className="h-5 w-5 text-orange-400" />
                    ) : promo.type === "group" ? (
                      <Gift className="h-5 w-5 text-purple-400" />
                    ) : (
                      <Percent className="h-5 w-5 text-green-400" />
                    )}
                  </div>

                  <p className="text-gray-400 text-sm mb-4">{promo.description}</p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300 text-sm">Promo Code:</span>
                      <Badge variant="outline" className="border-gray-600 text-gray-300 font-mono">
                        {promo.code}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300 text-sm">Valid Until:</span>
                      <div className="flex items-center text-gray-400 text-sm">
                        <Clock className="h-3 w-3 mr-1" />
                        {promo.validUntil}
                      </div>
                    </div>
                  </div>

                  <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">
                    Apply Offer
                  </Button>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>

        {/* Newsletter Signup */}
        <Card className="bg-gradient-to-r from-purple-900 to-blue-900 border-purple-500">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Never Miss a Deal!</h3>
            <p className="text-purple-200 mb-6">
              Subscribe to our newsletter and be the first to know about exclusive promotions, early bird offers, and
              special discounts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:border-white/40"
              />
              <Button className="bg-white text-purple-900 hover:bg-gray-100">Subscribe</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
