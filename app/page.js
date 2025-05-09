import Link from "next/link"; // Keep for potential future use on this page
// Image import removed as it's handled within GymCard
import { getAllGyms } from "@/app/_lib/data-service";
import GymCard from "@/app/_components/GymCard"; // Import the new component

export default async function Page() {
  const gyms = await getAllGyms();

  return (
    <main className="mt-12 md:mt-24 px-4 md:px-8">
      <div className="text-center mb-12 md:mb-16">
        <h1 className="text-4xl md:text-6xl text-accent-500 mb-6 tracking-tight font-semibold">
          Find Your Perfect Gym
        </h1>
        <p className="text-lg md:text-xl text-primary-200 max-w-2xl mx-auto">
          Browse our curated list of partner gyms and find the one that fits your fitness journey.
        </p>
      </div>

      {gyms && gyms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {gyms.map((gym) => (
            <GymCard key={gym.id} gym={gym} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <h2 className="text-2xl font-semibold text-primary-100 mb-4">No Gyms Available Yet</h2>
          <p className="text-primary-400">
            Please check back later, or if you are a gym owner, consider partnering with us!
          </p>
        </div>
      )}
    </main>
  );
}

// Revalidate data at most every hour (optional, for static generation with revalidation)
// export const revalidate = 3600;
