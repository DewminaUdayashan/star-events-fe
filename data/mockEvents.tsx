import type { Event, EventCategory } from "@/types/event"

export const eventCategories: EventCategory[] = [
  {
    id: "1",
    name: "Music Concerts",
    slug: "music",
    description: "Live music performances and concerts",
    icon: "🎵",
    color: "bg-purple-600",
    eventCount: 45,
  },
  {
    id: "2",
    name: "Theatre & Drama",
    slug: "theatre",
    description: "Stage performances and theatrical shows",
    icon: "🎭",
    color: "bg-red-600",
    eventCount: 23,
  },
  {
    id: "3",
    name: "Cultural Events",
    slug: "cultural",
    description: "Traditional and cultural celebrations",
    icon: "🎨",
    color: "bg-orange-600",
    eventCount: 18,
  },
  {
    id: "4",
    name: "Comedy Shows",
    slug: "comedy",
    description: "Stand-up comedy and humor events",
    icon: "😂",
    color: "bg-yellow-600",
    eventCount: 12,
  },
  {
    id: "5",
    name: "Electronic Music",
    slug: "electronic",
    description: "DJ sets and electronic music events",
    icon: "🎧",
    color: "bg-blue-600",
    eventCount: 31,
  },
  {
    id: "6",
    name: "Classical Music",
    slug: "classical",
    description: "Orchestra and classical performances",
    icon: "🎼",
    color: "bg-green-600",
    eventCount: 15,
  },
]

export const mockEvents: Event[] = [
  {
    id: "1",
    title: "Symphony Under the Stars",
    description:
      "Experience the magic of classical music under the open sky with the National Symphony Orchestra. This enchanting evening features masterpieces from Mozart, Beethoven, and contemporary composers.",
    shortDescription: "Classical music concert with the National Symphony Orchestra",
    image: "assets/event-classical.jpg",
    date: "2024-12-15",
    time: "19:30",
    location: "Colombo",
    venue: "Nelum Pokuna Theatre",
    category: "classical",
    price: 2500,
    originalPrice: 3000,
    discount: 17,
    organizerId: "org1",
    organizerName: "Cultural Arts Foundation",
    ticketsAvailable: 150,
    totalTickets: 300,
    tags: ["classical", "orchestra", "outdoor"],
    featured: true,
    trending: true,
    status: "upcoming",
    ticketTypes: [
      {
        id: "t1",
        name: "General Admission",
        price: 2500,
        description: "Standard seating",
        available: 100,
        total: 200,
        benefits: ["Standard seating", "Program booklet"],
      },
      {
        id: "t2",
        name: "VIP",
        price: 5000,
        description: "Premium seating with refreshments",
        available: 50,
        total: 100,
        benefits: ["Premium seating", "Welcome drink", "Meet & greet", "Program booklet"],
      },
    ],
  },
  {
    id: "2",
    title: "Rock Legends Live",
    description:
      "Get ready to rock with the biggest names in Sri Lankan rock music. An electrifying night featuring multiple bands and special guest performances.",
    shortDescription: "Epic rock concert with multiple bands",
    image: "assets/event-rock-concert.jpg",
    date: "2024-12-20",
    time: "20:00",
    location: "Kandy",
    venue: "Sugathadasa Stadium",
    category: "music",
    price: 1500,
    organizerId: "org2",
    organizerName: "Rock Events LK",
    ticketsAvailable: 800,
    totalTickets: 1000,
    tags: ["rock", "live music", "bands"],
    featured: true,
    trending: true,
    status: "upcoming",
    ticketTypes: [
      {
        id: "t3",
        name: "Standing",
        price: 1500,
        description: "Standing area near stage",
        available: 500,
        total: 600,
        benefits: ["Close to stage", "Standing area"],
      },
      {
        id: "t4",
        name: "Seated",
        price: 2000,
        description: "Reserved seating",
        available: 300,
        total: 400,
        benefits: ["Reserved seat", "Better view"],
      },
    ],
  },
  {
    id: "3",
    title: "Traditional Dance Spectacular",
    description:
      "Immerse yourself in the rich cultural heritage of Sri Lanka with traditional Kandyan and low-country dance performances by renowned artists.",
    shortDescription: "Traditional Sri Lankan dance performance",
    image: "assets/event-sri-lankan-dance.jpg",
    date: "2024-12-18",
    time: "18:00",
    location: "Kandy",
    venue: "Temple of the Tooth Cultural Centre",
    category: "cultural",
    price: 1200,
    organizerId: "org3",
    organizerName: "Heritage Arts Society",
    ticketsAvailable: 200,
    totalTickets: 250,
    tags: ["cultural", "traditional", "dance"],
    featured: false,
    trending: true,
    status: "upcoming",
    ticketTypes: [
      {
        id: "t5",
        name: "Standard",
        price: 1200,
        description: "Regular seating",
        available: 150,
        total: 200,
        benefits: ["Standard seating", "Cultural program"],
      },
      {
        id: "t6",
        name: "Premium",
        price: 2000,
        description: "Front row seating",
        available: 50,
        total: 50,
        benefits: ["Front row", "Photo opportunity", "Cultural program"],
      },
    ],
  },
  {
    id: "4",
    title: "Comedy Night Extravaganza",
    description:
      "Laugh until your sides hurt with the funniest comedians in the country. A night of non-stop entertainment and hilarious performances.",
    shortDescription: "Stand-up comedy show with top comedians",
    image: "assets/event-comedy.jpg",
    date: "2024-12-22",
    time: "19:00",
    location: "Colombo",
    venue: "Lionel Wendt Theatre",
    category: "comedy",
    price: 1800,
    organizerId: "org4",
    organizerName: "Laugh Factory LK",
    ticketsAvailable: 180,
    totalTickets: 200,
    tags: ["comedy", "entertainment", "stand-up"],
    featured: false,
    trending: false,
    status: "upcoming",
    ticketTypes: [
      {
        id: "t7",
        name: "Regular",
        price: 1800,
        description: "Standard seating",
        available: 150,
        total: 170,
        benefits: ["Standard seating"],
      },
      {
        id: "t8",
        name: "VIP Table",
        price: 3500,
        description: "Table seating with snacks",
        available: 30,
        total: 30,
        benefits: ["Table seating", "Complimentary snacks", "Priority entry"],
      },
    ],
  },
  {
    id: "5",
    title: "Electronic Beats Festival",
    description:
      "Dance the night away with the hottest DJs and electronic music artists. Featuring state-of-the-art sound systems and mesmerizing light shows.",
    shortDescription: "Electronic music festival with top DJs",
    image: "assets/event-electronic.jpg",
    date: "2024-12-25",
    time: "21:00",
    location: "Negombo",
    venue: "Beach Resort Arena",
    category: "electronic",
    price: 3000,
    organizerId: "org5",
    organizerName: "Electronic Vibes",
    ticketsAvailable: 500,
    totalTickets: 800,
    tags: ["electronic", "DJ", "festival", "dance"],
    featured: true,
    trending: true,
    status: "upcoming",
    ticketTypes: [
      {
        id: "t9",
        name: "General Entry",
        price: 3000,
        description: "Festival access",
        available: 400,
        total: 600,
        benefits: ["Festival access", "Dance floor"],
      },
      {
        id: "t10",
        name: "VIP Experience",
        price: 6000,
        description: "VIP area with bar access",
        available: 100,
        total: 200,
        benefits: ["VIP area", "Complimentary drinks", "Meet the DJs", "Premium sound"],
      },
    ],
  },
]

export const getTrendingEvents = (): Event[] => {
  return mockEvents.filter((event) => event.trending)
}

export const getEventsByCategory = (categorySlug: string): Event[] => {
  return mockEvents.filter((event) => event.category === categorySlug)
}

export const searchEvents = (query: string, category?: string, location?: string): Event[] => {
  let filteredEvents = mockEvents

  if (category && category !== "all") {
    filteredEvents = filteredEvents.filter((event) => event.category === category)
  }

  if (location && location !== "all") {
    filteredEvents = filteredEvents.filter((event) => event.location.toLowerCase().includes(location.toLowerCase()))
  }

  if (query) {
    const searchTerm = query.toLowerCase()
    filteredEvents = filteredEvents.filter(
      (event) =>
        event.title.toLowerCase().includes(searchTerm) ||
        event.description.toLowerCase().includes(searchTerm) ||
        event.tags.some((tag) => tag.toLowerCase().includes(searchTerm)) ||
        event.venue.toLowerCase().includes(searchTerm),
    )
  }

  return filteredEvents
}
