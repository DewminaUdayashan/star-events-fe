"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { authService } from "@/lib/services/auth.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus } from "lucide-react";

interface AdminCreateFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const AdminCreateForm = ({ onSuccess, onCancel }: AdminCreateFormProps) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    address: "",
    dateOfBirth: "",
  });

  const queryClient = useQueryClient();

  const createAdminMutation = useMutation({
    mutationFn: (data: typeof formData) => authService.createAdmin(data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Admin user created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setFormData({
        email: "",
        password: "",
        fullName: "",
        address: "",
        dateOfBirth: "",
      });
      onSuccess?.();
    },
    onError: (error: any) => {
      console.error("Create admin error:", error);
      console.error("Error response:", error?.response?.data);
      console.error("Error status:", error?.response?.status);

      let errorMessage = "Failed to create admin user";

      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.response?.data?.errors) {
        // Handle validation errors from ASP.NET Core
        const validationErrors = Object.values(
          error.response.data.errors
        ).flat();
        errorMessage = validationErrors.join(", ");
      } else if (error?.response?.status === 400) {
        errorMessage = "Bad request - please check your input data";
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (
      !formData.email ||
      !formData.password ||
      !formData.fullName ||
      !formData.address ||
      !formData.dateOfBirth
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Format the data properly for the API
    const submitData = {
      ...formData,
      dateOfBirth: new Date(formData.dateOfBirth).toISOString(), // Convert to full ISO format like curl
    };

    console.log("Submitting admin data:", submitData);
    createAdminMutation.mutate(submitData);
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Plus className="h-5 w-5" />
          Create New Admin User
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">
                Email *
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="admin@example.com"
                className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">
                Password *
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter password"
                className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-gray-300">
                Full Name *
              </Label>
              <Input
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="John Doe"
                className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth" className="text-gray-300">
                Date of Birth *
              </Label>
              <Input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
                className="bg-gray-700 border-gray-600 text-white"
                required
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address" className="text-gray-300">
                Address *
              </Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="123 Main St, City, State"
                className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                required
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={createAdminMutation.isPending}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              {createAdminMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Admin
                </>
              )}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AdminCreateForm;
