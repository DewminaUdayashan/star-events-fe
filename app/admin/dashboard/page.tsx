"use client";

import { Navigation } from "@/components/layout/Navigation";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  Calendar,
  Ticket,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Shield,
  BarChart3,
} from "lucide-react";

export default function AdminDashboard() {
  return (
    <ProtectedRoute requiredRole="Admin">
      <div className="min-h-screen bg-gray-900">
        <Navigation />

        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-400">Manage the StarEvents platform</p>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-400">
                      Total Users
                    </p>
                    <p className="text-2xl font-bold text-white">1,234</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-400">
                      Active Events
                    </p>
                    <p className="text-2xl font-bold text-white">89</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Ticket className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-400">
                      Tickets Sold
                    </p>
                    <p className="text-2xl font-bold text-white">5,678</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <DollarSign className="h-8 w-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-400">Revenue</p>
                    <p className="text-2xl font-bold text-white">$45,678</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Recent Activity */}
            <Card className="bg-gray-800 border-gray-700 lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Recent Activity</span>
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Latest platform activities and events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-white text-sm">
                        New event "Summer Music Festival" created
                      </p>
                      <p className="text-gray-400 text-xs">2 hours ago</p>
                    </div>
                    <Badge variant="outline">Event</Badge>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-white text-sm">
                        User "john.doe@example.com" registered
                      </p>
                      <p className="text-gray-400 text-xs">4 hours ago</p>
                    </div>
                    <Badge variant="outline">User</Badge>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-white text-sm">
                        50 tickets sold for "Tech Conference 2024"
                      </p>
                      <p className="text-gray-400 text-xs">6 hours ago</p>
                    </div>
                    <Badge variant="outline">Sales</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Quick Actions</span>
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Common administrative tasks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Users className="mr-2 h-4 w-4" />
                  Manage Users
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="mr-2 h-4 w-4" />
                  Review Events
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View Reports
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  System Alerts
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* System Status */}
          <Card className="bg-gray-800 border-gray-700 mt-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>System Status</span>
              </CardTitle>
              <CardDescription className="text-gray-400">
                Platform health and performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <span className="text-gray-400">API Status</span>
                  <Badge className="bg-green-600">Healthy</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <span className="text-gray-400">Database</span>
                  <Badge className="bg-green-600">Online</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <span className="text-gray-400">Payment Gateway</span>
                  <Badge className="bg-green-600">Active</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  );
}
