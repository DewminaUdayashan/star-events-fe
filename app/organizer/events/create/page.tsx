"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Upload,
  Calendar,
  Clock,
  MapPin,
  Users,
  Tag,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

interface EventPrice {
  id: string;
  category: string;
  price: number;
  stock: number;
  description: string;
}

interface EventFormData {
  title: string;
  description: string;
  category: string;
  eventDate: string;
  eventTime: string;
  venueName: string;
  venueLocation: string;
  venueCapacity: number;
  image: string;
  prices: EventPrice[];
  isPublished: boolean;
}

export default function CreateEventPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    description: "",
    category: "",
    eventDate: "",
    eventTime: "",
    venueName: "",
    venueLocation: "",
    venueCapacity: 0,
    image: "",
    prices: [
      {
        id: "1",
        category: "General Admission",
        price: 0,
        stock: 0,
        description: "Standard ticket",
      },
    ],
    isPublished: false,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handlePriceChange = (index: number, field: string, value: any) => {
    const newPrices = [...formData.prices];
    newPrices[index] = { ...newPrices[index], [field]: value };
    setFormData((prev) => ({ ...prev, prices: newPrices }));
  };

  const addPriceCategory = () => {
    const newPrice: EventPrice = {
      id: Date.now().toString(),
      category: "",
      price: 0,
      stock: 0,
      description: "",
    };
    setFormData((prev) => ({
      ...prev,
      prices: [...prev.prices, newPrice],
    }));
  };

  const removePriceCategory = (index: number) => {
    if (formData.prices.length > 1) {
      setFormData((prev) => ({
        ...prev,
        prices: prev.prices.filter((_, i) => i !== index),
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = "Event title is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.eventDate) newErrors.eventDate = "Event date is required";
    if (!formData.eventTime) newErrors.eventTime = "Event time is required";
    if (!formData.venueName.trim())
      newErrors.venueName = "Venue name is required";
    if (!formData.venueLocation.trim())
      newErrors.venueLocation = "Venue location is required";
    if (formData.venueCapacity <= 0)
      newErrors.venueCapacity = "Venue capacity must be greater than 0";

    // Validate prices
    formData.prices.forEach((price, index) => {
      if (!price.category.trim()) {
        newErrors[`price_${index}_category`] = "Price category is required";
      }
      if (price.price < 0) {
        newErrors[`price_${index}_price`] = "Price cannot be negative";
      }
      if (price.stock < 0) {
        newErrors[`price_${index}_stock`] = "Stock cannot be negative";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      // Here you would make the API call to create the event
      console.log("Creating event:", formData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Redirect to events list
      router.push("/organizer/events");
    } catch (error) {
      console.error("Error creating event:", error);
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    setFormData((prev) => ({ ...prev, isPublished: false }));
    handleSubmit(new Event("submit") as any);
  };

  const handlePublish = async () => {
    if (!validateForm()) return;
    setFormData((prev) => ({ ...prev, isPublished: true }));
    handleSubmit(new Event("submit") as any);
  };

  return (
    <ProtectedRoute requiredRole="Organizer">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Link href="/organizer/events">
                <Button
                  variant="ghost"
                  className="text-gray-400 hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Events
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Create New Event
                </h1>
                <p className="text-gray-400">
                  Fill in the details to create your event
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Tag className="h-5 w-5 mr-2" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-white">
                      Event Title *
                    </Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        handleInputChange("title", e.target.value)
                      }
                      placeholder="Enter event title"
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                    {errors.title && (
                      <p className="text-red-400 text-sm">{errors.title}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-white">
                      Category *
                    </Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        handleInputChange("category", value)
                      }
                    >
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="music">Music</SelectItem>
                        <SelectItem value="tech">Technology</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="sports">Sports</SelectItem>
                        <SelectItem value="art">Arts & Culture</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="food">Food & Drink</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.category && (
                      <p className="text-red-400 text-sm">{errors.category}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-white">
                    Description *
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    placeholder="Describe your event..."
                    rows={4}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                  {errors.description && (
                    <p className="text-red-400 text-sm">{errors.description}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image" className="text-white">
                    Event Image URL
                  </Label>
                  <div className="flex space-x-2">
                    <Input
                      id="image"
                      value={formData.image}
                      onChange={(e) =>
                        handleInputChange("image", e.target.value)
                      }
                      placeholder="https://example.com/image.jpg"
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="border-gray-600"
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Date, Time & Venue */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Date, Time & Venue
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="eventDate" className="text-white">
                      Event Date *
                    </Label>
                    <Input
                      id="eventDate"
                      type="date"
                      value={formData.eventDate}
                      onChange={(e) =>
                        handleInputChange("eventDate", e.target.value)
                      }
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                    {errors.eventDate && (
                      <p className="text-red-400 text-sm">{errors.eventDate}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="eventTime" className="text-white">
                      Event Time *
                    </Label>
                    <Input
                      id="eventTime"
                      type="time"
                      value={formData.eventTime}
                      onChange={(e) =>
                        handleInputChange("eventTime", e.target.value)
                      }
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                    {errors.eventTime && (
                      <p className="text-red-400 text-sm">{errors.eventTime}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="venueName" className="text-white">
                      Venue Name *
                    </Label>
                    <Input
                      id="venueName"
                      value={formData.venueName}
                      onChange={(e) =>
                        handleInputChange("venueName", e.target.value)
                      }
                      placeholder="Enter venue name"
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                    {errors.venueName && (
                      <p className="text-red-400 text-sm">{errors.venueName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="venueLocation" className="text-white">
                      Venue Location *
                    </Label>
                    <Input
                      id="venueLocation"
                      value={formData.venueLocation}
                      onChange={(e) =>
                        handleInputChange("venueLocation", e.target.value)
                      }
                      placeholder="City, Province"
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                    {errors.venueLocation && (
                      <p className="text-red-400 text-sm">
                        {errors.venueLocation}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="venueCapacity" className="text-white">
                    Venue Capacity *
                  </Label>
                  <Input
                    id="venueCapacity"
                    type="number"
                    value={formData.venueCapacity}
                    onChange={(e) =>
                      handleInputChange(
                        "venueCapacity",
                        parseInt(e.target.value) || 0
                      )
                    }
                    placeholder="Maximum number of attendees"
                    min="1"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                  {errors.venueCapacity && (
                    <p className="text-red-400 text-sm">
                      {errors.venueCapacity}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <div className="flex items-center">
                    <Tag className="h-5 w-5 mr-2" />
                    Ticket Pricing
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addPriceCategory}
                    className="border-gray-600"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.prices.map((price, index) => (
                  <div
                    key={price.id}
                    className="border border-gray-700 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-white font-medium">
                        Price Category {index + 1}
                      </h4>
                      {formData.prices.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removePriceCategory(index)}
                          className="border-gray-600 text-red-400 hover:bg-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label className="text-white">Category Name *</Label>
                        <Input
                          value={price.category}
                          onChange={(e) =>
                            handlePriceChange(index, "category", e.target.value)
                          }
                          placeholder="e.g., VIP, General"
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                        {errors[`price_${index}_category`] && (
                          <p className="text-red-400 text-sm">
                            {errors[`price_${index}_category`]}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-white">Price (Rs.) *</Label>
                        <Input
                          type="number"
                          value={price.price}
                          onChange={(e) =>
                            handlePriceChange(
                              index,
                              "price",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          placeholder="0"
                          min="0"
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                        {errors[`price_${index}_price`] && (
                          <p className="text-red-400 text-sm">
                            {errors[`price_${index}_price`]}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-white">
                          Available Tickets *
                        </Label>
                        <Input
                          type="number"
                          value={price.stock}
                          onChange={(e) =>
                            handlePriceChange(
                              index,
                              "stock",
                              parseInt(e.target.value) || 0
                            )
                          }
                          placeholder="0"
                          min="0"
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                        {errors[`price_${index}_stock`] && (
                          <p className="text-red-400 text-sm">
                            {errors[`price_${index}_stock`]}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-white">Description</Label>
                        <Input
                          value={price.description}
                          onChange={(e) =>
                            handlePriceChange(
                              index,
                              "description",
                              e.target.value
                            )
                          }
                          placeholder="Brief description"
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="publish"
                      checked={formData.isPublished}
                      onCheckedChange={(checked) =>
                        handleInputChange("isPublished", checked)
                      }
                    />
                    <Label htmlFor="publish" className="text-white">
                      Publish event immediately (make it visible to customers)
                    </Label>
                  </div>

                  <div className="flex space-x-4">
                    <Link href="/organizer/events">
                      <Button variant="outline" className="border-gray-600">
                        Cancel
                      </Button>
                    </Link>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleSaveDraft}
                      disabled={loading}
                      className="border-gray-600"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save as Draft
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      {loading ? (
                        "Creating..."
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          {formData.isPublished
                            ? "Create & Publish"
                            : "Create Event"}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}
