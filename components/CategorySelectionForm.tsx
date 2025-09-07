"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageIcon, DollarSign, Users, Eye } from "lucide-react";

// Category configuration with image mappings
const categoryConfig = {
  music: {
    label: "Music",
    image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop",
    defaultPrice: 50,
    description: "Concerts, festivals, and live music events"
  },
  sports: {
    label: "Sports",
    image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=300&fit=crop", 
    defaultPrice: 75,
    description: "Sporting events, matches, and competitions"
  },
  cultural: {
    label: "Cultural",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop",
    defaultPrice: 30,
    description: "Cultural events, exhibitions, and heritage shows"
  },
  technology: {
    label: "Technology", 
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop",
    defaultPrice: 100,
    description: "Tech conferences, workshops, and seminars"
  },
  business: {
    label: "Business",
    image: "https://images.unsplash.com/photo-1560472355-536de3962603?w=400&h=300&fit=crop",
    defaultPrice: 150,
    description: "Business meetings, conferences, and networking"
  },
  arts: {
    label: "Arts",
    image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop",
    defaultPrice: 40,
    description: "Art exhibitions, galleries, and creative events"
  },
  education: {
    label: "Education",
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=300&fit=crop",
    defaultPrice: 25,
    description: "Educational workshops, seminars, and courses"
  },
  food: {
    label: "Food",
    image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop",
    defaultPrice: 60,
    description: "Food festivals, cooking classes, and culinary events"
  },
  entertainment: {
    label: "Entertainment",
    image: "https://images.unsplash.com/photo-1489599511261-6ec906b24e20?w=400&h=300&fit=crop", 
    defaultPrice: 45,
    description: "Shows, comedy, theater, and entertainment events"
  },
  other: {
    label: "Other",
    image: "https://images.unsplash.com/photo-1515041219749-89347f83291a?w=400&h=300&fit=crop",
    defaultPrice: 35,
    description: "Miscellaneous events and activities"
  }
};

interface FormData {
  category: string;
  price: number;
  availableTickets: number;
}

interface FormErrors {
  category?: string;
  price?: string;
  availableTickets?: string;
}

export default function CategorySelectionForm() {
  const [formData, setFormData] = useState<FormData>({
    category: "",
    price: 0,
    availableTickets: 100,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [selectedCategoryImage, setSelectedCategoryImage] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(false);

  // Update image when category changes
  useEffect(() => {
    if (formData.category && categoryConfig[formData.category as keyof typeof categoryConfig]) {
      const config = categoryConfig[formData.category as keyof typeof categoryConfig];
      setIsImageLoading(true);
      setSelectedCategoryImage(config.image);
      
      // Auto-populate default price for the selected category
      if (formData.price === 0) {
        setFormData(prev => ({
          ...prev,
          price: config.defaultPrice
        }));
      }
    } else {
      setSelectedCategoryImage(null);
    }
  }, [formData.category]);

  // Handle input changes
  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Handle category selection
  const handleCategoryChange = (value: string) => {
    handleInputChange("category", value);
  };

  // Handle image load events
  const handleImageLoad = () => {
    setIsImageLoading(false);
  };

  const handleImageError = () => {
    setIsImageLoading(false);
    console.error("Failed to load category image");
  };

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.category) {
      newErrors.category = "Please select a category";
    }

    if (formData.price <= 0) {
      newErrors.price = "Price must be greater than 0";
    }

    if (formData.availableTickets <= 0) {
      newErrors.availableTickets = "Available tickets must be greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      console.log("Form submitted with data:", formData);
      console.log("Selected category config:", categoryConfig[formData.category as keyof typeof categoryConfig]);
      
      // Here you would typically send the data to your API
      alert(`Category: ${formData.category}\\nPrice: $${formData.price}\\nTickets: ${formData.availableTickets}`);
    }
  };

  // Reset form
  const handleReset = () => {
    setFormData({
      category: "",
      price: 0,
      availableTickets: 100,
    });
    setErrors({});
    setSelectedCategoryImage(null);
  };

  const selectedConfig = formData.category ? categoryConfig[formData.category as keyof typeof categoryConfig] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 p-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Event Category Selection
          </h1>
          <p className="text-gray-400">
            Choose a category and see the preview image instantly
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Form Section */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-purple-400" />
                Event Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Category Selection */}
                <div>
                  <Label htmlFor="category" className="text-white">
                    Event Category *
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={handleCategoryChange}
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      {Object.entries(categoryConfig).map(([key, config]) => (
                        <SelectItem key={key} value={key} className="text-white">
                          <div className="flex items-center gap-2">
                            <span>{config.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-red-400 text-sm mt-1">{errors.category}</p>
                  )}
                  
                  {/* Category Description */}
                  {selectedConfig && (
                    <p className="text-gray-400 text-sm mt-2">
                      {selectedConfig.description}
                    </p>
                  )}
                </div>

                {/* Price Input */}
                <div>
                  <Label htmlFor="price" className="text-white">
                    Ticket Price (USD) *
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="price"
                      type="number"
                      min="1"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) =>
                        handleInputChange("price", parseFloat(e.target.value) || 0)
                      }
                      className="bg-gray-700 border-gray-600 text-white pl-10"
                      placeholder="Enter ticket price"
                    />
                  </div>
                  {errors.price && (
                    <p className="text-red-400 text-sm mt-1">{errors.price}</p>
                  )}
                </div>

                {/* Available Tickets */}
                <div>
                  <Label htmlFor="availableTickets" className="text-white">
                    Available Tickets *
                  </Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="availableTickets"
                      type="number"
                      min="1"
                      value={formData.availableTickets}
                      onChange={(e) =>
                        handleInputChange("availableTickets", parseInt(e.target.value) || 0)
                      }
                      className="bg-gray-700 border-gray-600 text-white pl-10"
                      placeholder="Enter number of tickets"
                    />
                  </div>
                  {errors.availableTickets && (
                    <p className="text-red-400 text-sm mt-1">{errors.availableTickets}</p>
                  )}
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-700 text-white flex-1"
                  >
                    Create Event
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleReset}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    Reset
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Image Preview Section */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Eye className="w-5 h-5 text-purple-400" />
                Category Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedCategoryImage ? (
                <div className="space-y-4">
                  {/* Image Preview */}
                  <div className="relative w-full h-64 rounded-lg overflow-hidden bg-gray-700">
                    {isImageLoading && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400" />
                      </div>
                    )}
                    <Image
                      src={selectedCategoryImage}
                      alt={`${formData.category} category`}
                      fill
                      className="object-cover"
                      onLoad={handleImageLoad}
                      onError={handleImageError}
                    />
                  </div>

                  {/* Category Info */}
                  {selectedConfig && (
                    <div className="bg-gray-700/30 rounded-lg p-4 space-y-2">
                      <h3 className="text-white font-semibold text-lg">
                        {selectedConfig.label} Events
                      </h3>
                      <p className="text-gray-300 text-sm">
                        {selectedConfig.description}
                      </p>
                      <div className="flex justify-between items-center pt-2 border-t border-gray-600">
                        <span className="text-gray-400">Suggested Price:</span>
                        <span className="text-purple-400 font-semibold">
                          ${selectedConfig.defaultPrice}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <ImageIcon className="w-16 h-16 text-gray-500 mb-4" />
                  <h3 className="text-gray-400 text-lg font-medium mb-2">
                    No Category Selected
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Choose a category from the form to see the preview image
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Current Selection Summary */}
        {formData.category && (
          <Card className="bg-gray-800/50 border-gray-700 mt-6">
            <CardHeader>
              <CardTitle className="text-white">Current Selection Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4 text-center">
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <ImageIcon className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">Category</p>
                  <p className="text-white font-semibold">
                    {selectedConfig?.label}
                  </p>
                </div>
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">Price</p>
                  <p className="text-white font-semibold">
                    ${formData.price}
                  </p>
                </div>
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">Available Tickets</p>
                  <p className="text-white font-semibold">
                    {formData.availableTickets}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}