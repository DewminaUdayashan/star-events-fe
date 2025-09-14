"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Search, ShoppingCart, User, Calendar, Ticket, Settings, LogOut, Star, BarChart3 } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

interface NavbarProps {
  user?: {
    id: string
    firstName: string
    lastName: string
    role: "customer" | "organizer" | "admin"
    avatar?: string
  }
  cartItemCount?: number
}

export default function Navbar({ user: propUser, cartItemCount = 0 }: NavbarProps) {
  const { user: authUser, logout } = useAuth()
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  // Use auth user if available, otherwise use prop user
  const user = authUser || null

  const navigationItems = [
    { href: "/", label: "Home" },
    { href: "/events", label: "Events" },
    { href: "/categories", label: "Categories" },
  ]

  const userMenuItems = user
    ? [
        ...(user.id?.includes("customer") || (!user.id?.includes("admin") && !user.id?.includes("organizer"))
          ? [
              { href: "/my-tickets", label: "My Tickets", icon: Ticket },
              { href: "/bookings", label: "Booking History", icon: Calendar },
            ]
          : []),
        ...(user.id?.includes("organizer")
          ? [
              { href: "/organizer/dashboard", label: "Dashboard", icon: BarChart3 },
              { href: "/organizer/events", label: "My Events", icon: Calendar },
            ]
          : []),
        ...(user.id?.includes("admin")
          ? [
              { href: "/admin/dashboard", label: "Admin Dashboard", icon: BarChart3 },
              { href: "/admin/users", label: "Manage Users", icon: User },
              { href: "/admin/events", label: "Manage Events", icon: Calendar },
            ]
          : []),
        { href: "/profile", label: "Profile", icon: User },
        { href: "/settings", label: "Settings", icon: Settings },
      ]
    : []

  const handleLogout = () => {
    logout()
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-800 bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-gray-900/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-purple-600">
              <Star className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">StarEvents</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-300 hover:text-white transition-colors duration-200"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search events..."
                className="w-full rounded-3xl border border-gray-700 bg-gray-800 py-2 pl-10 pr-4 text-sm text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Mobile Search */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden text-gray-300 hover:text-white rounded-2xl"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Cart */}
            {!user?.id?.includes("admin") && !user?.id?.includes("organizer") && (
              <Link href="/cart">
                <Button variant="ghost" size="sm" className="relative text-gray-300 hover:text-white rounded-2xl">
                  <ShoppingCart className="h-5 w-5" />
                  {cartItemCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-purple-600 p-0 text-xs">
                      {cartItemCount}
                    </Badge>
                  )}
                </Button>
              </Link>
            )}

            {/* User Menu or Auth Buttons */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white rounded-2xl">
                    <User className="h-5 w-5" />
                    <span className="ml-2 hidden sm:inline">{user.fullName?.split(" ")[0] || "User"}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-gray-800 border-gray-700 rounded-3xl">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium text-white">{user.fullName || "User"}</p>
                    <p className="text-xs text-gray-400">
                      {user.id?.includes("admin") ? "Admin" : user.id?.includes("organizer") ? "Organizer" : "Customer"}
                    </p>
                  </div>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  {userMenuItems.map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link
                        href={item.href}
                        className="flex items-center text-gray-300 hover:text-white focus:text-white rounded-2xl"
                      >
                        <item.icon className="mr-2 h-4 w-4" />
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <DropdownMenuItem
                    className="text-gray-300 hover:text-white focus:text-white rounded-2xl cursor-pointer"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white rounded-2xl">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="bg-purple-600 hover:bg-purple-700 rounded-2xl">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden text-gray-300 hover:text-white rounded-2xl">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 bg-gray-900 border-gray-800 rounded-l-3xl">
                <div className="flex flex-col space-y-4 mt-8">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="text-lg text-gray-300 hover:text-white transition-colors p-2 rounded-2xl hover:bg-gray-800"
                    >
                      {item.label}
                    </Link>
                  ))}
                  {user && (
                    <>
                      <div className="border-t border-gray-700 pt-4">
                        {userMenuItems.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center py-2 text-gray-300 hover:text-white transition-colors rounded-2xl hover:bg-gray-800 px-2"
                          >
                            <item.icon className="mr-3 h-5 w-5" />
                            {item.label}
                          </Link>
                        ))}
                        <button
                          onClick={handleLogout}
                          className="flex items-center py-2 text-gray-300 hover:text-white transition-colors rounded-2xl hover:bg-gray-800 px-2 w-full text-left"
                        >
                          <LogOut className="mr-3 h-5 w-5" />
                          Sign Out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Mobile Search Bar */}
        {isSearchOpen && (
          <div className="lg:hidden py-4 border-t border-gray-800">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search events..."
                className="w-full rounded-3xl border border-gray-700 bg-gray-800 py-2 pl-10 pr-4 text-sm text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
