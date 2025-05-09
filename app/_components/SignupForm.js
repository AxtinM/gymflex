"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // For redirecting after successful signup
import Button from "./Button"; // Assuming you have a general Button component

function SignupForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(""); 
    setIsLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fullName, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Signup failed. Please try again.");
      } else {
        // Signup successful, redirect to login page or directly log them in
        // For simplicity, redirecting to login.
        // To directly log in, you'd call signIn() here.
        router.push("/login?signup=success"); 
      }
    } catch (err) {
      console.error("Signup submission error:", err);
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
        <label htmlFor="fullName" className="text-lg text-primary-200">
          Full Name
        </label>
        <input
          id="fullName"
          type="text"
          name="fullName"
          className="w-full bg-primary-200 text-primary-800 px-4 py-2 rounded-md focus:outline-none focus:ring focus:ring-accent-500"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

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
          minLength={6}
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="confirmPassword"
          className="text-lg text-primary-200"
        >
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          type="password"
          name="confirmPassword"
          className="w-full bg-primary-200 text-primary-800 px-4 py-2 rounded-md focus:outline-none focus:ring focus:ring-accent-500"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={6}
          disabled={isLoading}
        />
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <div className="mt-2">
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Signing up..." : "Sign up"}
        </Button>
      </div>
      <p className="text-center text-sm text-primary-300">
        Already have an account?{' '}
        <a href="/login" className="text-accent-500 hover:underline">
          Sign in
        </a>
      </p>
    </form>
  );
}

export default SignupForm;