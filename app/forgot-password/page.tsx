"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  Star,
  ArrowLeft,
  CheckCircle,
  Lock,
  Shield,
  AlertCircle,
} from "lucide-react";
import { authService } from "@/lib/services/auth.service";

type Step = "request-otp" | "verify-otp" | "reset-password" | "success";

export default function ForgotPasswordPage() {
  const [currentStep, setCurrentStep] = useState<Step>("request-otp");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpExpiresAt, setOtpExpiresAt] = useState<string>("");
  const [tokenExpiresAt, setTokenExpiresAt] = useState<string>("");
  const [remainingAttempts, setRemainingAttempts] = useState<number>(0);

  const router = useRouter();

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await authService.forgotPassword(email);
      setOtpExpiresAt(response.data.expiresAt);
      setRemainingAttempts(response.data.remainingAttempts);
      setCurrentStep("verify-otp");
    } catch (err: any) {
      if (err.response?.status === 429) {
        setError(
          "Too many password reset attempts. Please try again after 1 hour."
        );
      } else {
        setError("Failed to send OTP. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await authService.verifyResetOTP(email, otp);
      setResetToken(response.data.resetToken);
      setTokenExpiresAt(response.data.tokenExpiresAt);
      setCurrentStep("reset-password");
    } catch (err: any) {
      if (err.response?.status === 400) {
        setError("OTP has expired or is invalid. Please request a new one.");
      } else {
        setError("Failed to verify OTP. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      setLoading(false);
      return;
    }

    try {
      await authService.resetPasswordOTP(
        email,
        resetToken,
        newPassword,
        confirmPassword
      );
      setCurrentStep("success");
    } catch (err: any) {
      if (err.response?.status === 400) {
        setError(
          "Failed to reset password. The reset token may be invalid or expired."
        );
      } else {
        setError("Failed to reset password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setError("");
    setOtp("");

    try {
      const response = await authService.forgotPassword(email);
      setOtpExpiresAt(response.data.expiresAt);
      setRemainingAttempts(response.data.remainingAttempts);
    } catch (err: any) {
      if (err.response?.status === 429) {
        setError(
          "Too many password reset attempts. Please try again after 1 hour."
        );
      } else {
        setError("Failed to resend OTP. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const formatTimeRemaining = (expiresAt: string) => {
    if (!expiresAt) return "";
    const expires = new Date(expiresAt);
    const now = new Date();
    const diff = expires.getTime() - now.getTime();

    if (diff <= 0) return "Expired";

    const minutes = Math.floor(diff / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  if (currentStep === "success") {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center space-x-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-600">
                <Star className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">StarEvents</span>
            </Link>
          </div>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Password Reset Successfully
              </h2>
              <p className="text-gray-400 mb-6">
                Your password has been reset successfully. You can now log in
                with your new password.
              </p>
              <Button
                onClick={() => router.push("/login")}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                Go to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link
          href="/login"
          className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Login
        </Link>

        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-600">
              <Star className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">StarEvents</span>
          </Link>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-center space-x-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep === "request-otp"
                  ? "bg-purple-600 text-white"
                  : ["verify-otp", "reset-password"].includes(currentStep)
                  ? "bg-green-600 text-white"
                  : "bg-gray-600 text-gray-400"
              }`}
            >
              1
            </div>
            <div
              className={`w-8 h-1 ${
                ["verify-otp", "reset-password"].includes(currentStep)
                  ? "bg-green-600"
                  : "bg-gray-600"
              }`}
            />
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep === "verify-otp"
                  ? "bg-purple-600 text-white"
                  : currentStep === "reset-password"
                  ? "bg-green-600 text-white"
                  : "bg-gray-600 text-gray-400"
              }`}
            >
              2
            </div>
            <div
              className={`w-8 h-1 ${
                currentStep === "reset-password"
                  ? "bg-green-600"
                  : "bg-gray-600"
              }`}
            />
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep === "reset-password"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-600 text-gray-400"
              }`}
            >
              3
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-2 px-2">
            <span>Email</span>
            <span>Verify</span>
            <span>Reset</span>
          </div>
        </div>

        <Card className="bg-gray-800 border-gray-700">
          {currentStep === "request-otp" && (
            <>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-white">
                  Reset Password
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Enter your email address and we'll send you an OTP to reset
                  your password
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRequestOTP} className="space-y-4">
                  {error && (
                    <Alert className="border-red-500 bg-red-500/10">
                      <AlertCircle className="h-4 w-4 text-red-400" />
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
                        placeholder="Enter your email"
                        className="pl-10 bg-gray-900 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending OTP...
                      </>
                    ) : (
                      "Send OTP"
                    )}
                  </Button>
                </form>
              </CardContent>
            </>
          )}

          {currentStep === "verify-otp" && (
            <>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-white">Enter OTP</CardTitle>
                <CardDescription className="text-gray-400">
                  We've sent a 6-digit OTP to{" "}
                  <strong className="text-white">{email}</strong>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  {error && (
                    <Alert className="border-red-500 bg-red-500/10">
                      <AlertCircle className="h-4 w-4 text-red-400" />
                      <AlertDescription className="text-red-400">
                        {error}
                      </AlertDescription>
                    </Alert>
                  )}

                  {otpExpiresAt && (
                    <Alert className="border-blue-500 bg-blue-500/10">
                      <Shield className="h-4 w-4 text-blue-400" />
                      <AlertDescription className="text-blue-400">
                        OTP expires in: {formatTimeRemaining(otpExpiresAt)} |
                        Remaining attempts: {remainingAttempts}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <label
                      htmlFor="otp"
                      className="text-sm font-medium text-gray-300"
                    >
                      6-Digit OTP
                    </label>
                    <Input
                      id="otp"
                      type="text"
                      value={otp}
                      onChange={(e) =>
                        setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                      placeholder="Enter 6-digit OTP"
                      className="text-center text-2xl bg-gray-900 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500"
                      maxLength={6}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    disabled={loading || otp.length !== 6}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying OTP...
                      </>
                    ) : (
                      "Verify OTP"
                    )}
                  </Button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={loading}
                      className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      Didn't receive OTP? Resend
                    </button>
                  </div>
                </form>
              </CardContent>
            </>
          )}

          {currentStep === "reset-password" && (
            <>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-white">
                  Set New Password
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Create a strong password for your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleResetPassword} className="space-y-4">
                  {error && (
                    <Alert className="border-red-500 bg-red-500/10">
                      <AlertCircle className="h-4 w-4 text-red-400" />
                      <AlertDescription className="text-red-400">
                        {error}
                      </AlertDescription>
                    </Alert>
                  )}

                  {tokenExpiresAt && (
                    <Alert className="border-blue-500 bg-blue-500/10">
                      <Shield className="h-4 w-4 text-blue-400" />
                      <AlertDescription className="text-blue-400">
                        Reset token expires in:{" "}
                        {formatTimeRemaining(tokenExpiresAt)}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <label
                      htmlFor="newPassword"
                      className="text-sm font-medium text-gray-300"
                    >
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="pl-10 bg-gray-900 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500"
                        required
                        minLength={8}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="confirmPassword"
                      className="text-sm font-medium text-gray-300"
                    >
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        className="pl-10 bg-gray-900 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500"
                        required
                        minLength={8}
                      />
                    </div>
                  </div>

                  <div className="text-xs text-gray-400">
                    Password must be at least 8 characters long and contain a
                    mix of uppercase, lowercase, numbers, and special
                    characters.
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    disabled={loading || !newPassword || !confirmPassword}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Resetting Password...
                      </>
                    ) : (
                      "Reset Password"
                    )}
                  </Button>
                </form>
              </CardContent>
            </>
          )}
        </Card>

        {currentStep !== "reset-password" && (
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Remember your password?{" "}
              <Link
                href="/login"
                className="text-purple-400 hover:text-purple-300 transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
