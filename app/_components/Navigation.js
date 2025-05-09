import Link from "next/link";
import { auth } from "../_lib/auth";

export default async function Navigation() {
  const session = await auth();

  return (
    <nav className="z-10 text-xl">
      <ul className="flex gap-8 md:gap-12 items-center"> {/* Adjusted gap for responsiveness */}
        <li>
          <Link
            href="/" // Changed from /cabins to homepage
            className="hover:text-accent-400 transition-colors"
          >
            Gyms
          </Link>
        </li>
        <li>
          <Link
            href="/about" // Kept /about, can be created later
            className="hover:text-accent-400 transition-colors"
          >
            About
          </Link>
        </li>
        <li>
          {session?.user ? ( // Check if user session exists
            <Link
              href="/account"
              className="hover:text-accent-400 transition-colors"
            >
              My Account
            </Link>
          ) : (
            <Link
              href="/login" // Link to login page if not authenticated
              className="hover:text-accent-400 transition-colors"
            >
              Login
            </Link>
          )}
        </li>
        {/* Optionally, add a signup link if user is not logged in and not on signup page */}
        {/* {!session?.user && (
          <li>
            <Link href="/signup" className="bg-accent-500 px-4 py-2 rounded text-primary-800 hover:bg-accent-600 transition-colors">
              Sign Up
            </Link>
          </li>
        )} */}
      </ul>
    </nav>
  );
}
