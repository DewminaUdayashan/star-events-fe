import { useState, useEffect, useCallback } from 'react'
import { adminService, organizerService } from '@/lib/services'
import type { SalesReport, UserReport, EventReport, MonitoringReport, OrganizerReport } from '@/lib/types/api'

// Admin Reports
export function useAdminReports() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getSalesReport = useCallback(async (startDate?: string, endDate?: string) => {
    try {
      setLoading(true)
      setError(null)
      const report = await adminService.getSalesReport(startDate, endDate)
      return report
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch sales report'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const getUsersReport = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const report = await adminService.getUsersReport()
      return report
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch users report'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const getEventsReport = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const report = await adminService.getEventsReport()
      return report
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch events report'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const getMonitoringReport = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const report = await adminService.getMonitoringReport()
      return report
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch monitoring report'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    getSalesReport,
    getUsersReport,
    getEventsReport,
    getMonitoringReport,
    loading,
    error
  }
}

// Organizer Reports
export function useOrganizerReports() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getOrganizerReport = useCallback(async (startDate?: string, endDate?: string) => {
    try {
      setLoading(true)
      setError(null)
      const report = await organizerService.getOrganizerReport(startDate, endDate)
      return report
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch organizer report'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const getEventAnalytics = useCallback(async (eventId: string) => {
    try {
      setLoading(true)
      setError(null)
      const analytics = await organizerService.getEventAnalytics(eventId)
      return analytics
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch event analytics'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const getSalesReport = useCallback(async (startDate?: string, endDate?: string) => {
    try {
      setLoading(true)
      setError(null)
      const report = await organizerService.getSalesReport(startDate, endDate)
      return report
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch sales report'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  const getCustomerInsights = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const insights = await organizerService.getCustomerInsights()
      return insights
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch customer insights'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    getOrganizerReport,
    getEventAnalytics,
    getSalesReport,
    getCustomerInsights,
    loading,
    error
  }
}

// Dashboard Data
export function useAdminDashboard() {
  const [dashboard, setDashboard] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await adminService.getDashboard()
      setDashboard(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  const refetch = useCallback(() => {
    fetchDashboard()
  }, [fetchDashboard])

  return { dashboard, loading, error, refetch }
}

export function useOrganizerDashboard() {
  const [dashboard, setDashboard] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await organizerService.getDashboard()
      setDashboard(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  const refetch = useCallback(() => {
    fetchDashboard()
  }, [fetchDashboard])

  return { dashboard, loading, error, refetch }
}

// Real-time Reports (with periodic updates)
export function useRealTimeReports(interval: number = 30000) {
  const [reports, setReports] = useState<{
    sales?: SalesReport
    users?: UserReport
    events?: EventReport
    monitoring?: MonitoringReport
  }>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAllReports = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [sales, users, events, monitoring] = await Promise.all([
        adminService.getSalesReport(),
        adminService.getUsersReport(),
        adminService.getEventsReport(),
        adminService.getMonitoringReport()
      ])

      setReports({ sales, users, events, monitoring })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reports')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAllReports()
    
    const intervalId = setInterval(fetchAllReports, interval)
    return () => clearInterval(intervalId)
  }, [fetchAllReports, interval])

  return { reports, loading, error, refetch: fetchAllReports }
}
