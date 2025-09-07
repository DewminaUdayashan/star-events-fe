"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageIcon, DollarSign, Users } from "lucide-react";

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
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=300&fit=crop",
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

interface PriceTier {
  name: string;
  price: number;
  availableTickets: number;
}

interface CategoryPricingFormProps {
  priceTiers: PriceTier[];
  category: string;
  onPriceTierChange: (index: number, field: keyof PriceTier, value: any) => void;
  onCategoryChange: (category: string) => void;
  errors?: {
    category?: string;
    priceTiers?: string;
  };
}

export default function CategoryPricingForm({
  priceTiers,
  category,
  onPriceTierChange,
  onCategoryChange,
  errors = {}
}: CategoryPricingFormProps) {
  const [selectedCategoryImage, setSelectedCategoryImage] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(false);

  // Update image when category changes
  useEffect(() => {
    if (category && categoryConfig[category as keyof typeof categoryConfig]) {
      const config = categoryConfig[category as keyof typeof categoryConfig];
      setIsImageLoading(true);
      setSelectedCategoryImage(config.image);
    } else {
      setSelectedCategoryImage(null);
    }
  }, [category]);

  // Handle category selection with auto-pricing
  const handleCategoryChange = (value: string) => {
    onCategoryChange(value);
    
    // Auto-populate default price for the first tier if it's empty or zero
    if (priceTiers.length > 0 && priceTiers[0].price === 0) {
      const config = categoryConfig[value as keyof typeof categoryConfig];
      if (config) {
        onPriceTierChange(0, "price", config.defaultPrice);
      }
    }
  };

  // Handle image load events
  const handleImageLoad = () => {
    setIsImageLoading(false);
  };

  const handleImageError = () => {
    setIsImageLoading(false);
    console.error("Failed to load category image");
  };

  const selectedConfig = category ? categoryConfig[category as keyof typeof categoryConfig] : null;

  return (
    <div className="space-y-6">
      {/* Category Selection with Image Preview */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-purple-400" />
            Category & Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Category Selection */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="category" className="text-white">
                  Event Category *
                </Label>
                <Select value={category} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    {Object.entries(categoryConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key} className="text-white">
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-red-400 text-sm mt-1">{errors.category}</p>
                )}
              </div>

              {/* Category Description */}
              {selectedConfig && (
                <div className="bg-gray-700/30 rounded-lg p-3">
                  <p className="text-gray-300 text-sm">
                    {selectedConfig.description}
                  </p>
                  <p className="text-purple-400 text-sm mt-1">
                    Suggested price: ${selectedConfig.defaultPrice}
                  </p>
                </div>
              )}
            </div>

            {/* Image Preview */}
            <div>
              {selectedCategoryImage ? (
                <div className="space-y-2">
                  <Label className="text-white text-sm">Category Preview</Label>
                  <div className="relative w-full h-40 rounded-lg overflow-hidden bg-gray-700">
                    {isImageLoading && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-400" />
                      </div>
                    )}
                    <Image
                      src={selectedCategoryImage}
                      alt={`${category} category`}
                      fill
                      className="object-cover"
                      onLoad={handleImageLoad}
                      onError={handleImageError}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-600 rounded-lg">
                  <ImageIcon className="w-8 h-8 text-gray-500 mb-2" />
                  <p className="text-gray-500 text-sm text-center">
                    Select a category to see preview
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Tiers */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-purple-400" />
            Pricing Tiers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {priceTiers.map((tier, index) => (
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
                      onPriceTierChange(index, "name", e.target.value)
                    }
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="e.g., General, VIP"
                  />
                </div>
                <div className="w-full sm:w-32">
                  <Label className="text-white text-sm">Price ($)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={tier.price}
                      onChange={(e) =>
                        onPriceTierChange(index, "price", parseFloat(e.target.value) || 0)
                      }
                      className="bg-gray-700 border-gray-600 text-white pl-10"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="w-full sm:w-32">
                  <Label className="text-white text-sm">Tickets</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      type="number"
                      min="1"
                      value={tier.availableTickets}
                      onChange={(e) =>
                        onPriceTierChange(
                          index,
                          "availableTickets",
                          parseInt(e.target.value) || 1
                        )
                      }
                      className="bg-gray-700 border-gray-600 text-white pl-10"
                      placeholder="100"
                    />
                  </div>
                </div>
              </div>
            ))}
            {errors.priceTiers && (
              <p className="text-red-400 text-sm">{errors.priceTiers}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}