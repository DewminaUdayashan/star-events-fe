"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  Mail,
  Lock,
  Star,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | React.ReactElement>("");
  const [successMessage, setSuccessMessage] = useState("");

  const { login, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check for success messages from URL params
  useEffect(() => {
    const message = searchParams.get("message");
    if (message === "email-verified") {
      setSuccessMessage("Email verified successfully! You can now log in.");
    }
  }, [searchParams]);

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      await login({ email, password });
      router.push("/");
    } catch (err: any) {
      console.log("Login error:", err);

      // Handle email verification required error
      if (err.statusCode === 401 && err.requiresEmailVerification) {
        setError(
          <div>
            <div className="font-semibold mb-2">
              Email verification required
            </div>
            <div className="text-sm mb-3">{err.error}</div>
            <Link
              href={`/auth/verify-email?email=${encodeURIComponent(
                err.email || email
              )}`}
              className="inline-flex items-center justify-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Verify Email
            </Link>
          </div>
        );
      } else {
        setError(err instanceof Error ? err.message : "Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to Home */}
        <Link
          href="/"
          className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-600">
              <Star className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">StarEvents</span>
          </Link>
        </div>

        <Card className="bg-gray-800 border-gray-700 rounded-3xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white">Welcome Back</CardTitle>
            <CardDescription className="text-gray-400">
              Sign in to your account to continue booking amazing events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {successMessage && (
                <Alert className="border-green-500 bg-green-500/10 rounded-2xl">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <AlertDescription className="text-green-400">
                    {successMessage}
                  </AlertDescription>
                </Alert>
              )}

              {error && (
                <Alert className="border-red-500 bg-red-500/10 rounded-2xl">
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                  <AlertDescription className="text-red-400">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-300"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="pl-10 bg-gray-900 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 rounded-2xl"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-300"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="pl-10 bg-gray-900 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 rounded-2xl"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <input
                    id="remember"
                    type="checkbox"
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <label htmlFor="remember" className="text-sm text-gray-300">
                    Remember me
                  </label>
                </div>
                <Link
                  href="/forgot-password"
                  className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-2xl h-12 font-semibold"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-gray-400">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="text-purple-400 hover:text-purple-300 font-semibold"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
