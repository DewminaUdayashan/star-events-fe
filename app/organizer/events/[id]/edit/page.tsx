"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Upload,
  X,
  Calendar,
  Clock,
  MapPin,
  ImageIcon,
  DollarSign,
  Users,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  useCreateEvent,
  useUpdateEvent,
  useOrganizerEvent,
} from "@/lib/services/organizer-hooks";
import { VenueSelect } from "@/components/VenueSelect";
import { getImageUrl } from "@/lib/utils";

interface PriceTier {
  name: string;
  price: number;
  availableTickets: number;
}

interface FormData {
  title: string;
  description: string;
  eventDate: string;
  eventTime: string;
  venueId: string;
  category: string;
  isPublished: boolean;
  imageFile: File | null;
  priceTiers: PriceTier[];
}

interface FormErrors {
  title?: string;
  description?: string;
  eventDate?: string;
  eventTime?: string;
  venueId?: string;
  category?: string;
  imageFile?: string;
  priceTiers?: string;
  general?: string;
}

const categories = [
  "music",
  "sports",
  "cultural",
  "technology",
  "business",
  "arts",
  "education",
  "food",
  "entertainment",
  "other",
];

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params?.id as string;
  const isEditMode = true; // Always true for edit page
  const { toast } = useToast();

  // API hooks
  const createEventMutation = useCreateEvent();
  const updateEventMutation = useUpdateEvent();

  // Only load event if we have an eventId
  const {
    data: existingEvent,
    isLoading: isLoadingEvent,
    error: eventError,
  } = useOrganizerEvent(eventId);

  // Form state
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    eventDate: "",
    eventTime: "",
    venueId: "",
    category: "",
    isPublished: false,
    imageFile: null,
    priceTiers: [
      {
        name: "General",
        price: 0,
        availableTickets: 100,
      },
    ],
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Load existing event data for editing
  useEffect(() => {
    if (existingEvent && !isLoadingEvent) {
      const event = existingEvent;

      setFormData({
        title: event.title || "",
        description: event.description || "",
        eventDate: event.eventDate
          ? new Date(event.eventDate).toISOString().split("T")[0]
          : "",
        eventTime: event.eventTime || "",
        venueId: event.venueId || "",
        category: event.category || "",
        isPublished: event.isPublished,
        imageFile: null,
        priceTiers: event.prices?.map((p) => ({
          name: p.category || "General",
          price: p.price,
          availableTickets: p.stock,
        })) || [
          {
            name: "General",
            price: 0,
            availableTickets: 100,
          },
        ],
      });

      if (event.imageUrl) {
        setImagePreview(getImageUrl(event.imageUrl));
      }
    }
  }, [existingEvent, isLoadingEvent]);

  // Validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.eventDate) {
      newErrors.eventDate = "Event date is required";
    } else {
      const selectedDate = new Date(formData.eventDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        newErrors.eventDate = "Event date cannot be in the past";
      }
    }

    if (!formData.eventTime) {
      newErrors.eventTime = "Event time is required";
    }

    if (!formData.venueId) {
      newErrors.venueId = "Venue is required";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (formData.priceTiers.length === 0) {
      newErrors.priceTiers = "At least one pricing tier is required";
    } else {
      const hasInvalidPrices = formData.priceTiers.some(
        (tier) =>
          tier.price < 0 || tier.availableTickets < 0 || !tier.name.trim()
      );
      if (hasInvalidPrices) {
        newErrors.priceTiers =
          "All pricing tiers must have valid names, prices, and ticket counts";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // For updates, create FormData for multipart/form-data
      const updateFormData = new FormData();
      updateFormData.append("Title", formData.title);
      updateFormData.append("Description", formData.description);
      updateFormData.append("EventDate", formData.eventDate);
      updateFormData.append("EventTime", formData.eventTime);
      updateFormData.append("VenueId", formData.venueId);
      updateFormData.append("Category", formData.category);
      updateFormData.append("IsPublished", formData.isPublished.toString());
      updateFormData.append("PricesJson", JSON.stringify(formData.priceTiers));

      if (formData.imageFile) {
        updateFormData.append("ImageFile", formData.imageFile);
      }

      await updateEventMutation.mutateAsync({
        id: eventId,
        eventData: updateFormData,
      });

      toast({
        title: "Success",
        description: "Event updated successfully!",
      });

      router.push("/organizer/events");
    } catch (error: any) {
      console.error("Submit error:", error);

      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update event";

      setErrors({
        general: errorMessage,
      });

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type and size
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({
          ...prev,
          imageFile: "Please select a valid image file",
        }));
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        setErrors((prev) => ({
          ...prev,
          imageFile: "Image file size must be less than 5MB",
        }));
        return;
      }

      handleInputChange("imageFile", file);

      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Clear any existing error
      if (errors.imageFile) {
        setErrors((prev) => ({ ...prev, imageFile: undefined }));
      }
    }
  };

  // Handle pricing tier changes
  const handlePriceTierChange = (
    index: number,
    field: keyof PriceTier,
    value: any
  ) => {
    const newTiers = [...formData.priceTiers];
    newTiers[index] = { ...newTiers[index], [field]: value };
    handleInputChange("priceTiers", newTiers);
  };

  const addPriceTier = () => {
    const newTier: PriceTier = {
      name: "",
      price: 0,
      availableTickets: 100,
    };
    handleInputChange("priceTiers", [...formData.priceTiers, newTier]);
  };

  const removePriceTier = (index: number) => {
    if (formData.priceTiers.length > 1) {
      const newTiers = formData.priceTiers.filter((_, i) => i !== index);
      handleInputChange("priceTiers", newTiers);
    }
  };

  const clearImage = () => {
    handleInputChange("imageFile", null);
    setImagePreview(null);
  };

  // Loading state
  if (isLoadingEvent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4" />
          <p className="text-white">Loading event data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (eventError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">
            Error Loading Event
          </h1>
          <p className="text-gray-400 mb-6">
            Failed to load event data. Please try again.
          </p>
          <Link href="/organizer/events">
            <Button className="bg-purple-600 hover:bg-purple-700">
              Back to Events
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/organizer/events">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Events
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">Edit Event</h1>
              <p className="text-gray-400">
                Update your event details and settings
              </p>
            </div>
          </div>

          {/* Error Alert */}
          {errors.general && (
            <Card className="mb-6 border-red-500/20 bg-red-500/10">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-red-400">
                  <X className="w-4 h-4" />
                  <p>{errors.general}</p>
                </div>
              </CardContent>
            </Card>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-400" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Title */}
                <div>
                  <Label htmlFor="title" className="text-white">
                    Event Title *
                  </Label>
                  <Input
                    id="title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="Enter event title"
                  />
                  {errors.title && (
                    <p className="text-red-400 text-sm mt-1">{errors.title}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description" className="text-white">
                    Description *
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    className="bg-gray-700 border-gray-600 text-white min-h-[120px]"
                    placeholder="Describe your event..."
                  />
                  {errors.description && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.description}
                    </p>
                  )}
                </div>

                {/* Date and Time */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
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
                      className="bg-gray-700 border-gray-600 text-white [color-scheme:dark]"
                    />
                    {errors.eventDate && (
                      <p className="text-red-400 text-sm mt-1">
                        {errors.eventDate}
                      </p>
                    )}
                  </div>

                  <div>
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
                      className="bg-gray-700 border-gray-600 text-white [color-scheme:dark]"
                    />
                    {errors.eventTime && (
                      <p className="text-red-400 text-sm mt-1">
                        {errors.eventTime}
                      </p>
                    )}
                  </div>
                </div>

                {/* Venue and Category */}
                <div className="grid md:grid-cols-2 gap-4">
                  <VenueSelect
                    value={formData.venueId}
                    onValueChange={(value) =>
                      handleInputChange("venueId", value)
                    }
                    error={errors.venueId}
                  />

                  <div>
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
                        {categories.map((category) => (
                          <SelectItem
                            key={category}
                            value={category}
                            className="text-white"
                          >
                            {category.charAt(0).toUpperCase() +
                              category.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.category && (
                      <p className="text-red-400 text-sm mt-1">
                        {errors.category}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Event Image */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-purple-400" />
                  Event Image
                </CardTitle>
              </CardHeader>
              <CardContent>
                {imagePreview ? (
                  <div className="relative">
                    <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-700">
                      <Image
                        src={imagePreview}
                        alt="Event image preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={clearImage}
                        className="border-gray-600 text-gray-300 hover:bg-gray-700"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Remove Image
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          document.getElementById("imageFile")?.click()
                        }
                        className="border-gray-600 text-gray-300 hover:bg-gray-700"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Change Image
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
                    <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <div className="space-y-2">
                      <p className="text-gray-300">No image selected</p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          document.getElementById("imageFile")?.click()
                        }
                        className="border-gray-600 text-gray-300 hover:bg-gray-700"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Image
                      </Button>
                    </div>
                  </div>
                )}

                <input
                  id="imageFile"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />

                {errors.imageFile && (
                  <p className="text-red-400 text-sm mt-2">
                    {errors.imageFile}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Pricing Tiers */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-purple-400" />
                    Pricing Tiers *
                  </CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addPriceTier}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Tier
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {formData.priceTiers.map((tier, index) => (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row gap-3 p-4 bg-gray-700/30 rounded-lg"
                    >
                      <div className="flex-1">
                        <Label className="text-white text-sm">Tier Name</Label>
                        <Input
                          type="text"
                          value={tier.name}
                          onChange={(e) =>
                            handlePriceTierChange(index, "name", e.target.value)
                          }
                          className="bg-gray-700 border-gray-600 text-white"
                          placeholder="e.g., VIP, General"
                        />
                      </div>
                      <div className="flex-1">
                        <Label className="text-white text-sm">
                          Price (LKR)
                        </Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={tier.price}
                          onChange={(e) =>
                            handlePriceTierChange(
                              index,
                              "price",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="bg-gray-700 border-gray-600 text-white"
                          placeholder="0.00"
                        />
                      </div>
                      <div className="flex-1">
                        <Label className="text-white text-sm">
                          Available Tickets
                        </Label>
                        <Input
                          type="number"
                          min="1"
                          value={tier.availableTickets}
                          onChange={(e) =>
                            handlePriceTierChange(
                              index,
                              "availableTickets",
                              parseInt(e.target.value) || 1
                            )
                          }
                          className="bg-gray-700 border-gray-600 text-white"
                          placeholder="100"
                        />
                      </div>
                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removePriceTier(index)}
                          disabled={formData.priceTiers.length === 1}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                {errors.priceTiers && (
                  <p className="text-red-400 text-sm mt-2">
                    {errors.priceTiers}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Settings */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isPublished"
                    checked={formData.isPublished}
                    onCheckedChange={(checked) =>
                      handleInputChange("isPublished", checked)
                    }
                    className="border-gray-600"
                  />
                  <Label htmlFor="isPublished" className="text-white">
                    Publish event
                  </Label>
                </div>
                <p className="text-gray-400 text-sm mt-1">
                  {formData.isPublished
                    ? "Event is visible to customers"
                    : "Event is saved as draft"}
                </p>
              </CardContent>
            </Card>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-purple-600 hover:bg-purple-700 text-white flex-1"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Updating...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Update Event
                  </div>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
                className="border-gray-600 text-gray-300 hover:bg-gray-700 sm:flex-none"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
