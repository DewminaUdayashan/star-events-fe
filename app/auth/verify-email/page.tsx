"use client";

import React, { useState, useEffect, useRef } from "react";
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
  Star,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { authService } from "@/lib/services/auth.service";

export default function VerifyEmailPage() {
  const [verificationCode, setVerificationCode] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [email, setEmail] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    } else {
      // Redirect to register if no email provided
      router.push("/register");
    }
  }, [searchParams, router]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit

    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);
    setError(""); // Clear error when user starts typing

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Handle backspace
    if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = verificationCode.join("");

    if (code.length !== 6) {
      setError("Please enter the complete 6-digit verification code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await authService.verifyEmail(email, code);
      setSuccess(true);

      // Redirect to login page after 2 seconds
      setTimeout(() => {
        router.push("/login?message=email-verified");
      }, 2000);
    } catch (err: any) {
      if (err.statusCode === 400) {
        setError("Invalid verification code. Please check and try again.");
      } else {
        setError(err.message || "Verification failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendTimer > 0) return;

    setResendLoading(true);
    setError("");

    try {
      await authService.resendVerificationCode(email);
      setResendTimer(120); // 2 minutes countdown
      setError("");
      // Clear current code
      setVerificationCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err.message || "Failed to resend verification code");
    } finally {
      setResendLoading(false);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    const newCode = [...verificationCode];

    for (let i = 0; i < pastedData.length && i < 6; i++) {
      if (/^\d$/.test(pastedData[i])) {
        newCode[i] = pastedData[i];
      }
    }

    setVerificationCode(newCode);
    setError("");

    // Focus on the next empty input or the last input
    const nextEmptyIndex = newCode.findIndex((code) => code === "");
    const focusIndex = nextEmptyIndex !== -1 ? nextEmptyIndex : 5;
    inputRefs.current[focusIndex]?.focus();
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="mb-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 mb-4">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Email Verified!
            </h1>
            <p className="text-gray-400">
              Your email has been successfully verified. Redirecting to login
              page...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back to Register */}
        <Link
          href="/register"
          className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Register
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
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-600/10 mb-4">
              <Mail className="h-6 w-6 text-purple-400" />
            </div>
            <CardTitle className="text-2xl text-white">
              Verify Your Email
            </CardTitle>
            <CardDescription className="text-gray-400">
              We've sent a 6-digit verification code to{" "}
              <span className="font-medium text-purple-400">{email}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert className="border-red-500 bg-red-500/10 rounded-2xl">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <AlertDescription className="text-red-400">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Verification Code Inputs */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Enter verification code
                </label>
                <div
                  className="flex justify-between gap-2"
                  onPaste={handlePaste}
                >
                  {verificationCode.map((digit, index) => (
                    <Input
                      key={index}
                      ref={(el) => {
                        inputRefs.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleInputChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-12 text-center text-lg font-semibold bg-gray-700 border-gray-600 text-white rounded-xl focus:border-purple-500 focus:ring-purple-500"
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  You can paste the code if you copied it from your email
                </p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading || verificationCode.join("").length !== 6}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-2xl h-12 font-semibold"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify Email"
                )}
              </Button>

              {/* Resend Code */}
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-2">
                  Didn't receive the code?
                </p>
                {resendTimer > 0 ? (
                  <p className="text-gray-500 text-sm">
                    Resend code in {Math.floor(resendTimer / 60)}:
                    {(resendTimer % 60).toString().padStart(2, "0")}
                  </p>
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleResendCode}
                    disabled={resendLoading}
                    className="text-purple-400 hover:text-purple-300 hover:bg-purple-600/10 rounded-xl"
                  >
                    {resendLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Resend verification code"
                    )}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Help Text */}
        <div className="text-center mt-6">
          <p className="text-gray-500 text-sm">
            Having trouble?{" "}
            <Link
              href="/support"
              className="text-purple-400 hover:text-purple-300 font-medium"
            >
              Contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
