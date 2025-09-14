"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Users, 
  Calendar, 
  Ticket, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  BarChart3,
  PieChart,
  Download,
  RefreshCw,
  Loader2
} from 'lucide-react'
import { useAdminDashboard, useAdminReports } from '@/hooks/useReports'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell } from 'recharts'
import type { AdminDashboard as AdminDashboardType } from '@/lib/services/admin.service'

const COLORS = ['#7c3aed', '#3b82f6', '#10b981', '#f59e0b', '#ef4444']

export function AdminDashboard() {
  const { dashboard, loading, error, refetch } = useAdminDashboard()
  const { getSalesReport, getUsersReport, getEventsReport, getMonitoringReport, loading: reportsLoading } = useAdminReports()
  const [activeTab, setActiveTab] = useState('overview')
  const [reports, setReports] = useState<any>({})

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const [sales, users, events, monitoring] = await Promise.all([
          getSalesReport(),
          getUsersReport(),
          getEventsReport(),
          getMonitoringReport()
        ])
        setReports({ sales, users, events, monitoring })
      } catch (err) {
        console.error('Failed to fetch reports:', err)
      }
    }

    fetchReports()
  }, [getSalesReport, getUsersReport, getEventsReport, getMonitoringReport])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR'
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-LK').format(num)
  }

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? (
      <TrendingUp className="h-4 w-4 text-green-400" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-400" />
    )
  }

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-400' : 'text-red-400'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <p className="text-red-400">{error}</p>
        <Button onClick={refetch} className="mt-4" variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    )
  }

  if (!dashboard) return null

  const { stats, recentEvents, recentUsers, systemHealth, salesChart } = dashboard

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-400">Monitor and manage your event platform</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={refetch} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Users</p>
                <p className="text-2xl font-bold text-white">{formatNumber(stats.totalUsers)}</p>
                <div className="flex items-center mt-1">
                  {getGrowthIcon(stats.monthlyGrowth.users)}
                  <span className={`text-sm ml-1 ${getGrowthColor(stats.monthlyGrowth.users)}`}>
                    {Math.abs(stats.monthlyGrowth.users)}%
                  </span>
                </div>
              </div>
              <Users className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Events</p>
                <p className="text-2xl font-bold text-white">{formatNumber(stats.totalEvents)}</p>
                <div className="flex items-center mt-1">
                  {getGrowthIcon(stats.monthlyGrowth.events)}
                  <span className={`text-sm ml-1 ${getGrowthColor(stats.monthlyGrowth.events)}`}>
                    {Math.abs(stats.monthlyGrowth.events)}%
                  </span>
                </div>
              </div>
              <Calendar className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Tickets Sold</p>
                <p className="text-2xl font-bold text-white">{formatNumber(stats.totalTicketsSold)}</p>
                <div className="flex items-center mt-1">
                  <Activity className="h-4 w-4 text-purple-400" />
                  <span className="text-sm ml-1 text-gray-400">
                    {stats.activeEvents} active events
                  </span>
                </div>
              </div>
              <Ticket className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Revenue</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(stats.totalRevenue)}</p>
                <div className="flex items-center mt-1">
                  {getGrowthIcon(stats.monthlyGrowth.revenue)}
                  <span className={`text-sm ml-1 ${getGrowthColor(stats.monthlyGrowth.revenue)}`}>
                    {Math.abs(stats.monthlyGrowth.revenue)}%
                  </span>
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Activity className="mr-2 h-5 w-5" />
            System Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${
                systemHealth.status === 'healthy' ? 'bg-green-400' : 
                systemHealth.status === 'degraded' ? 'bg-yellow-400' : 'bg-red-400'
              }`} />
              <p className="text-gray-400 text-sm">Overall Status</p>
              <p className="text-white font-medium capitalize">{systemHealth.status}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{systemHealth.uptime}%</p>
              <p className="text-gray-400 text-sm">Uptime</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{systemHealth.responseTime}ms</p>
              <p className="text-gray-400 text-sm">Response Time</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{systemHealth.activeConnections}</p>
              <p className="text-gray-400 text-sm">Active Connections</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600">
            <BarChart3 className="mr-2 h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="events" className="data-[state=active]:bg-purple-600">
            <Calendar className="mr-2 h-4 w-4" />
            Events
          </TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-purple-600">
            <Users className="mr-2 h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-purple-600">
            <PieChart className="mr-2 h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Sales Chart */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Sales Overview</CardTitle>
              <CardDescription className="text-gray-400">
                Revenue and ticket sales over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#7c3aed" 
                    strokeWidth={2}
                    name="Revenue (LKR)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="tickets" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Tickets Sold"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Categories */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Top Categories</CardTitle>
              <CardDescription className="text-gray-400">
                Most popular event categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.topCategories.map((category, index) => (
                  <div key={category.category} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="text-white">{category.category}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">{formatNumber(category.count)} events</p>
                      <p className="text-gray-400 text-sm">{formatCurrency(category.revenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Events */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Recent Events</CardTitle>
                <CardDescription className="text-gray-400">
                  Latest events created
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentEvents.map((event: any) => (
                  <div key={event.id} className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
                    <div>
                      <p className="text-white font-medium">{event.title}</p>
                      <p className="text-gray-400 text-sm">{event.category}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={event.isPublished ? "default" : "secondary"}>
                        {event.isPublished ? 'Published' : 'Draft'}
                      </Badge>
                      <p className="text-gray-400 text-sm mt-1">
                        {new Date(event.eventDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Event Status */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Event Status</CardTitle>
                <CardDescription className="text-gray-400">
                  Current event distribution
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span className="text-gray-300">Active Events</span>
                    </div>
                    <span className="text-white font-medium">{stats.activeEvents}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-yellow-400" />
                      <span className="text-gray-300">Pending Events</span>
                    </div>
                    <span className="text-white font-medium">{stats.pendingEvents}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Eye className="h-4 w-4 text-blue-400" />
                      <span className="text-gray-300">Total Events</span>
                    </div>
                    <span className="text-white font-medium">{stats.totalEvents}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Recent Users</CardTitle>
              <CardDescription className="text-gray-400">
                Latest user registrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentUsers.map((user: any) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-gray-900 rounded-lg">
                    <div>
                      <p className="text-white font-medium">{user.fullName || user.email}</p>
                      <p className="text-gray-400 text-sm">{user.email}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={user.isActive ? "default" : "secondary"}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <p className="text-gray-400 text-sm mt-1">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Revenue by Month</CardTitle>
                <CardDescription className="text-gray-400">
                  Monthly revenue breakdown
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={salesChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }} 
                    />
                    <Bar dataKey="revenue" fill="#7c3aed" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Category Distribution */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Category Distribution</CardTitle>
                <CardDescription className="text-gray-400">
                  Events by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsPieChart>
                    <Pie
                      data={stats.topCategories}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {stats.topCategories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
