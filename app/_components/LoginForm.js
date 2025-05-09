"use client";

import { signIn } from "next-auth/react"; // Use client-side signIn
import { useState } from "react";
import Button from "./Button"; // Assuming you have a general Button component

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); // Clear previous errors
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        redirect: false, // Handle redirect manually to show errors
        email,
        password,
      });

      if (result?.error) {
        setError("Login failed. Please check your email and password.");
        console.error("Login error:", result.error);
      } else if (result?.ok && result?.url) {
        // Successful login, redirect to account page or the URL provided by NextAuth
        window.location.href = "/account"; // Or router.push('/account') if using useRouter
      } else {
        // Should not happen if result.error or result.ok is not set
        setError("An unexpected error occurred during login.");
      }
    } catch (err) {
      console.error("Login submission error:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-primary-900 py-8 px-10 rounded-lg text-left w-full max-w-md flex flex-col gap-4"
    >
      <div className="space-y-2">
        <label htmlFor="email" className="text-lg text-primary-200">
          Email address
        </label>
        <input
          id="email"
          type="email"
          name="email"
          className="w-full bg-primary-200 text-primary-800 px-4 py-2 rounded-md focus:outline-none focus:ring focus:ring-accent-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="password"
          className="text-lg text-primary-200"
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          name="password"
          className="w-full bg-primary-200 text-primary-800 px-4 py-2 rounded-md focus:outline-none focus:ring focus:ring-accent-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <div className="mt-2">
        {/* Assuming Button component takes children and disabled prop */}
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Signing in..." : "Sign in"}
        </Button>
      </div>
       <p className="text-center text-sm text-primary-300">
        Don't have an account?{' '}
        <a href="/signup" className="text-accent-500 hover:underline">
          Sign up
        </a>
      </p>
    </form>
  );
}

export default LoginForm;