"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import ButtonPrimary from "@/shared/ButtonPrimary";
import Input from "@/shared/Input";
import { Route } from "@/routers/types";

export default function LoginPage() {
  const router = useRouter();
  const { login, user } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      const dashboard = user.role === "ADMIN" ? "/admin/dashboard" :
        user.role === "HUNTER" ? "/haunter-dashboard" :
          "/tenant-dashboard";
      router.push(dashboard as Route);
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login form submitted");
    setError("");
    setLoading(true);

    try {
      console.log("Calling login with:", email);
      const success = await login(email, password);
      console.log("Login result:", success);

      if (success) {
        // Router.push will happen in useEffect above
      } else {
        setError("Invalid email or password");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="nc-LoginPage">
      <div className="container">
        <div className="max-w-md mx-auto py-16 lg:py-24">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold mb-2">Welcome Back!</h1>
            <p className="text-neutral-600 dark:text-neutral-300">
              Sign in to continue to House Haunters
            </p>
          </div>

          {/* Test Credentials Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-sm mb-2">🔐 Test Credentials:</h3>
            <div className="text-xs space-y-1 text-blue-900 dark:text-blue-100">
              <p>
                <strong>Admin:</strong> admin@househaunters.com / admin123
              </p>
              <p>
                <strong>Tenant:</strong> tenant@househaunters.com / tenant123
              </p>
              <p>
                <strong>Hunter:</strong> hunter@househaunters.com / hunter123
              </p>
            </div>
          </div>

          {/* Login Form */}
          <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg p-8">
            <form onSubmit={handleSubmit} method="POST" className="space-y-6">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-red-800 dark:text-red-200 text-sm">
                  <i className="las la-exclamation-circle mr-2"></i>
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm">Remember me</span>
                </label>
                <Link
                  href={"/forgot-password" as Route}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Forgot password?
                </Link>
              </div>

              <ButtonPrimary
                type="submit"
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Signing in...
                  </>
                ) : (
                  <>
                    <i className="las la-sign-in-alt mr-2"></i>
                    Sign In
                  </>
                )}
              </ButtonPrimary>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Don&apos;t have an account?{" "}
                <Link
                  href={"/signup" as Route}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
