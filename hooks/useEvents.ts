import { useState, useEffect, useCallback } from 'react'
import { eventsService } from '@/lib/services/events.service'
import type { Event, EventFilters } from '@/lib/types/api'

export function useEvents(filters?: EventFilters) {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await eventsService.getEvents(filters)
      setEvents(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch events')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  const refetch = useCallback(() => {
    fetchEvents()
  }, [fetchEvents])

  return { events, loading, error, refetch }
}

export function useEvent(id: string) {
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEvent = useCallback(async () => {
    if (!id) return

    try {
      setLoading(true)
      setError(null)
      const data = await eventsService.getEventById(id)
      setEvent(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch event')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchEvent()
  }, [fetchEvent])

  const refetch = useCallback(() => {
    fetchEvent()
  }, [fetchEvent])

  return { event, loading, error, refetch }
}

export function useEventSearch() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchEvents = useCallback(async (keyword: string, filters?: EventFilters) => {
    if (!keyword.trim()) {
      setEvents([])
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await eventsService.searchEvents(keyword, filters)
      setEvents(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed')
    } finally {
      setLoading(false)
    }
  }, [])

  const clearSearch = useCallback(() => {
    setEvents([])
    setError(null)
  }, [])

  return { events, loading, error, searchEvents, clearSearch }
}

export function useEventCategories() {
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      // This would typically be a separate endpoint
      const events = await eventsService.getEvents()
      const uniqueCategories = Array.from(new Set(events.map(event => event.category).filter(Boolean)))
      setCategories(uniqueCategories as string[])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch categories')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  return { categories, loading, error }
}
