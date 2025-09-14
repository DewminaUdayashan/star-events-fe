"use client"

import React, { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Image, 
  Plus, 
  Trash2, 
  Save, 
  Eye, 
  EyeOff,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { organizerService } from '@/lib/services/organizer.service'
import { adminService } from '@/lib/services/admin.service'
import type { Event, EventPrice, Venue } from '@/lib/types/api'

const eventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  description: z.string().min(1, 'Description is required').max(1000, 'Description too long'),
  eventDate: z.string().min(1, 'Event date is required'),
  eventTime: z.string().min(1, 'Event time is required'),
  venueId: z.string().min(1, 'Venue is required'),
  category: z.string().min(1, 'Category is required'),
  image: z.string().url('Invalid image URL').optional().or(z.literal('')),
  isPublished: z.boolean(),
  prices: z.array(z.object({
    category: z.string().min(1, 'Price category is required'),
    price: z.number().min(0, 'Price must be positive'),
    stock: z.number().min(0, 'Stock must be positive'),
    isActive: z.boolean()
  })).min(1, 'At least one price tier is required')
})

type EventFormData = z.infer<typeof eventSchema>

interface EventFormProps {
  event?: Event
  onSuccess: (event: Event) => void
  onCancel: () => void
  isAdmin?: boolean
}

export function EventForm({ event, onSuccess, onCancel, isAdmin = false }: EventFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [venues, setVenues] = useState<Venue[]>([])
  const [loadingVenues, setLoadingVenues] = useState(true)

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty }
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: event?.title || '',
      description: event?.description || '',
      eventDate: event?.eventDate ? new Date(event.eventDate).toISOString().split('T')[0] : '',
      eventTime: event?.eventTime ? new Date(event.eventTime).toTimeString().slice(0, 5) : '',
      venueId: event?.venueId || '',
      category: event?.category || '',
      image: event?.image || '',
      isPublished: event?.isPublished || false,
      prices: event?.prices?.length ? event.prices.map(price => ({
        category: price.category || '',
        price: price.price,
        stock: price.stock,
        isActive: price.isActive
      })) : [{
        category: 'General',
        price: 0,
        stock: 100,
        isActive: true
      }]
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'prices'
  })

  const isPublished = watch('isPublished')

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        setLoadingVenues(true)
        const venuesData = isAdmin 
          ? await adminService.getAllVenues()
          : await organizerService.getOrganizerProfile() // This would need to be implemented
        setVenues(venuesData)
      } catch (err) {
        console.error('Failed to fetch venues:', err)
      } finally {
        setLoadingVenues(false)
      }
    }

    fetchVenues()
  }, [isAdmin])

  const onSubmit = async (data: EventFormData) => {
    setLoading(true)
    setError(null)

    try {
      const eventData = {
        ...data,
        eventDate: new Date(`${data.eventDate}T${data.eventTime}`).toISOString(),
        eventTime: new Date(`${data.eventDate}T${data.eventTime}`).toISOString()
      }

      let result: Event
      if (event) {
        // Update existing event
        result = isAdmin 
          ? await adminService.updateEvent(event.id, eventData)
          : await organizerService.updateEvent(event.id, eventData)
      } else {
        // Create new event
        result = isAdmin 
          ? await adminService.createEvent(eventData)
          : await organizerService.createEvent(eventData)
      }

      onSuccess(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save event')
    } finally {
      setLoading(false)
    }
  }

  const addPriceTier = () => {
    append({
      category: '',
      price: 0,
      stock: 100,
      isActive: true
    })
  }

  const removePriceTier = (index: number) => {
    if (fields.length > 1) {
      remove(index)
    }
  }

  const categories = [
    'Concert',
    'Theatre',
    'Cultural',
    'Sports',
    'Conference',
    'Workshop',
    'Exhibition',
    'Festival',
    'Other'
  ]

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <Alert className="border-red-500 bg-red-500/10">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-400">{error}</AlertDescription>
        </Alert>
      )}

      {/* Basic Information */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Event Information</CardTitle>
          <CardDescription className="text-gray-400">
            Basic details about your event
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-gray-300">Event Title *</Label>
              <Input
                id="title"
                {...register('title')}
                className="bg-gray-900 border-gray-600 text-white"
                placeholder="Enter event title"
              />
              {errors.title && (
                <p className="text-red-400 text-sm">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-gray-300">Category *</Label>
              <Select onValueChange={(value) => setValue('category', value)}>
                <SelectTrigger className="bg-gray-900 border-gray-600 text-white">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-red-400 text-sm">{errors.category.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-300">Description *</Label>
            <Textarea
              id="description"
              {...register('description')}
              className="bg-gray-900 border-gray-600 text-white min-h-[100px]"
              placeholder="Describe your event..."
            />
            {errors.description && (
              <p className="text-red-400 text-sm">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="image" className="text-gray-300">Event Image URL</Label>
            <div className="flex space-x-2">
              <Image className="h-4 w-4 text-gray-400 mt-3" />
              <Input
                id="image"
                {...register('image')}
                className="bg-gray-900 border-gray-600 text-white"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            {errors.image && (
              <p className="text-red-400 text-sm">{errors.image.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Date, Time & Venue */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Date, Time & Venue</CardTitle>
          <CardDescription className="text-gray-400">
            When and where your event will take place
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="eventDate" className="text-gray-300">Event Date *</Label>
              <div className="flex space-x-2">
                <Calendar className="h-4 w-4 text-gray-400 mt-3" />
                <Input
                  id="eventDate"
                  type="date"
                  {...register('eventDate')}
                  className="bg-gray-900 border-gray-600 text-white"
                />
              </div>
              {errors.eventDate && (
                <p className="text-red-400 text-sm">{errors.eventDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="eventTime" className="text-gray-300">Event Time *</Label>
              <div className="flex space-x-2">
                <Clock className="h-4 w-4 text-gray-400 mt-3" />
                <Input
                  id="eventTime"
                  type="time"
                  {...register('eventTime')}
                  className="bg-gray-900 border-gray-600 text-white"
                />
              </div>
              {errors.eventTime && (
                <p className="text-red-400 text-sm">{errors.eventTime.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="venueId" className="text-gray-300">Venue *</Label>
              <div className="flex space-x-2">
                <MapPin className="h-4 w-4 text-gray-400 mt-3" />
                <Select onValueChange={(value) => setValue('venueId', value)}>
                  <SelectTrigger className="bg-gray-900 border-gray-600 text-white">
                    <SelectValue placeholder={loadingVenues ? "Loading..." : "Select venue"} />
                  </SelectTrigger>
                  <SelectContent>
                    {venues.map((venue) => (
                      <SelectItem key={venue.id} value={venue.id}>
                        {venue.name} - {venue.location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {errors.venueId && (
                <p className="text-red-400 text-sm">{errors.venueId.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Tiers */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Pricing Tiers</CardTitle>
              <CardDescription className="text-gray-400">
                Set different price categories for your event
              </CardDescription>
            </div>
            <Button
              type="button"
              onClick={addPriceTier}
              variant="outline"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Tier
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="p-4 bg-gray-900 rounded-lg border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-white font-medium">Price Tier {index + 1}</h4>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    onClick={() => removePriceTier(index)}
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Category</Label>
                  <Input
                    {...register(`prices.${index}.category`)}
                    className="bg-gray-800 border-gray-600 text-white"
                    placeholder="e.g., VIP, General"
                  />
                  {errors.prices?.[index]?.category && (
                    <p className="text-red-400 text-sm">{errors.prices[index]?.category?.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Price (LKR)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    {...register(`prices.${index}.price`, { valueAsNumber: true })}
                    className="bg-gray-800 border-gray-600 text-white"
                    placeholder="0.00"
                  />
                  {errors.prices?.[index]?.price && (
                    <p className="text-red-400 text-sm">{errors.prices[index]?.price?.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Stock</Label>
                  <Input
                    type="number"
                    {...register(`prices.${index}.stock`, { valueAsNumber: true })}
                    className="bg-gray-800 border-gray-600 text-white"
                    placeholder="100"
                  />
                  {errors.prices?.[index]?.stock && (
                    <p className="text-red-400 text-sm">{errors.prices[index]?.stock?.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Active</Label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      {...register(`prices.${index}.isActive`)}
                      className="data-[state=checked]:bg-purple-600"
                    />
                    <span className="text-gray-300 text-sm">
                      {watch(`prices.${index}.isActive`) ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {errors.prices && (
            <p className="text-red-400 text-sm">{errors.prices.message}</p>
          )}
        </CardContent>
      </Card>

      {/* Publishing Options */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Publishing Options</CardTitle>
          <CardDescription className="text-gray-400">
            Control when your event becomes visible to the public
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-gray-300">Publish Event</Label>
              <p className="text-gray-400 text-sm">
                Make this event visible to the public
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {isPublished ? (
                <Eye className="h-4 w-4 text-green-400" />
              ) : (
                <EyeOff className="h-4 w-4 text-gray-400" />
              )}
              <Switch
                {...register('isPublished')}
                className="data-[state=checked]:bg-purple-600"
              />
              <Badge variant={isPublished ? "default" : "secondary"}>
                {isPublished ? 'Published' : 'Draft'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex items-center justify-between pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>

        <div className="flex space-x-2">
          <Button
            type="submit"
            disabled={loading || !isDirty}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {event ? 'Update Event' : 'Create Event'}
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}
