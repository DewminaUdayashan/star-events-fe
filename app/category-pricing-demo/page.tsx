"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CategoryPricingForm from "@/components/CategoryPricingForm";
import { Save, Eye } from "lucide-react";

interface PriceTier {
  name: string;
  price: number;
  availableTickets: number;
}

export default function CategoryPricingDemo() {
  const [category, setCategory] = useState("");
  const [priceTiers, setPriceTiers] = useState<PriceTier[]>([
    {
      name: "General",
      price: 0,
      availableTickets: 100,
    },
  ]);
  const [errors, setErrors] = useState<{ category?: string; priceTiers?: string }>({});

  // Handle pricing tier changes
  const handlePriceTierChange = (
    index: number,
    field: keyof PriceTier,
    value: any
  ) => {
    const newTiers = [...priceTiers];
    newTiers[index] = { ...newTiers[index], [field]: value };
    setPriceTiers(newTiers);
    
    // Clear errors when user makes changes
    if (errors.priceTiers) {
      setErrors(prev => ({ ...prev, priceTiers: undefined }));
    }
  };

  // Handle category change
  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    
    // Clear category error when user selects
    if (errors.category) {
      setErrors(prev => ({ ...prev, category: undefined }));
    }
  };

  // Add new pricing tier
  const addPriceTier = () => {
    setPriceTiers([
      ...priceTiers,
      {
        name: "",
        price: 0,
        availableTickets: 100,
      },
    ]);
  };

  // Remove pricing tier
  const removePriceTier = (index: number) => {
    if (priceTiers.length > 1) {
      const newTiers = priceTiers.filter((_, i) => i !== index);
      setPriceTiers(newTiers);
    }
  };

  // Form validation
  const validateForm = () => {
    const newErrors: { category?: string; priceTiers?: string } = {};

    if (!category) {
      newErrors.category = "Please select a category";
    }

    const hasInvalidTiers = priceTiers.some(
      (tier) => !tier.name.trim() || tier.price <= 0 || tier.availableTickets <= 0
    );

    if (hasInvalidTiers) {
      newErrors.priceTiers = "All tiers must have a name, valid price, and available tickets";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = () => {
    if (validateForm()) {
      console.log("Form data:", { category, priceTiers });
      alert("Form submitted successfully! Check console for data.");
    }
  };

  // Reset form
  const handleReset = () => {
    setCategory("");
    setPriceTiers([
      {
        name: "General",
        price: 0,
        availableTickets: 100,
      },
    ]);
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900 p-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Interactive Category & Pricing Form
          </h1>
          <p className="text-gray-400">
            Select a category to see instant image preview and configure pricing
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <CategoryPricingForm
              category={category}
              priceTiers={priceTiers}
              onCategoryChange={handleCategoryChange}
              onPriceTierChange={handlePriceTierChange}
              errors={errors}
            />

            {/* Additional Pricing Actions */}
            <Card className="bg-gray-800/50 border-gray-700 mt-6">
              <CardHeader>
                <CardTitle className="text-white">Pricing Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addPriceTier}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    Add Pricing Tier
                  </Button>
                  {priceTiers.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => removePriceTier(priceTiers.length - 1)}
                      className="border-red-600 text-red-400 hover:bg-red-900/20"
                    >
                      Remove Last Tier
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Submit Actions */}
            <div className="flex gap-4 mt-6">
              <Button
                onClick={handleSubmit}
                className="bg-purple-600 hover:bg-purple-700 text-white flex-1"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Configuration
              </Button>
              <Button
                variant="outline"
                onClick={handleReset}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Reset
              </Button>
            </div>
          </div>

          {/* Live Preview Section */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-800/50 border-gray-700 sticky top-4">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Eye className="w-5 h-5 text-purple-400" />
                  Live Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                {category ? (
                  <div className="space-y-4">
                    <div className="bg-gray-700/30 rounded-lg p-3">
                      <h3 className="text-white font-semibold">{category.charAt(0).toUpperCase() + category.slice(1)} Event</h3>
                      <p className="text-gray-400 text-sm mt-1">Category selected</p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-white text-sm font-medium">Pricing Tiers:</h4>
                      {priceTiers.map((tier, index) => (
                        <div key={index} className="bg-gray-700/20 rounded p-2 text-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-white">
                              {tier.name || `Tier ${index + 1}`}
                            </span>
                            <span className="text-purple-400">
                              ${tier.price}
                            </span>
                          </div>
                          <div className="text-gray-400 text-xs">
                            {tier.availableTickets} tickets available
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="bg-purple-900/20 border border-purple-600/20 rounded-lg p-3">
                      <p className="text-purple-400 text-sm">
                        Total Revenue Potential:
                      </p>
                      <p className="text-white text-lg font-semibold">
                        ${priceTiers.reduce((total, tier) => total + (tier.price * tier.availableTickets), 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Eye className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-400">
                      Select a category to see the preview
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}