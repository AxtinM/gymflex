import { getGymById } from "@/app/_lib/data-service";
// import Image from "next/image"; // Removed next/image for external URLs
import Link from "next/link";
import MembershipCard from "@/app/_components/MembershipCard"; // Import the new component
import { auth } from "@/app/_lib/auth"; // To get session

// Helper to display opening hours (can be more sophisticated)
function DisplayOpeningHours({ hours }) {
  if (!hours) return <p className="text-primary-300">Not available</p>;
  // Assuming hours is an object like { mon: "9-5", tue: "9-5", ... }
  return (
    <ul className="space-y-1 text-primary-300">
      {Object.entries(hours).map(([day, time]) => (
        <li key={day}>
          <span className="font-semibold capitalize">{day}:</span> {time}
        </li>
      ))}
    </ul>
  );
}

// Inline MembershipCard component removed

export async function generateMetadata({ params }) {
  try {
    const gym = await getGymById(params.gymId);
    if (!gym) return { title: "Gym Not Found" };
    return {
      title: `${gym.name} | Gym Details`,
      description: gym.facilities_description?.substring(0, 160) || `Details for ${gym.name}`,
    };
  } catch (error) {
    return { title: "Error Loading Gym" };
  }
}

export default async function Page({ params }) {
  const session = await auth(); // Get session on the server
  const currentUserId = session?.user?.id;

  let gym;
  try {
    gym = await getGymById(params.gymId);
  } catch (error) {
    // If getGymById throws (e.g. not found), we can render an error message
    // Or, if getGymById uses Next.js notFound(), this component won't even render.
    // For now, let's assume it might throw a generic error for other reasons.
    return (
      <div className="text-center py-10">
        <h1 className="text-3xl font-semibold text-red-500 mb-4">Error Loading Gym</h1>
        <p className="text-primary-300">{error.message || "Could not retrieve gym details."}</p>
        <Link href="/" className="mt-6 inline-block bg-accent-500 text-primary-800 px-6 py-3 rounded-md hover:bg-accent-600">
            Back to All Gyms
        </Link>
      </div>
    );
  }

  if (!gym) {
    // This case might be handled by notFound() in getGymById if preferred
    return (
        <div className="text-center py-10">
            <h1 className="text-3xl font-semibold text-primary-200 mb-4">Gym Not Found</h1>
            <p className="text-primary-300">Sorry, we couldn't find the gym you're looking for.</p>
            <Link href="/" className="mt-6 inline-block bg-accent-500 text-primary-800 px-6 py-3 rounded-md hover:bg-accent-600">
                Back to All Gyms
            </Link>
        </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-5xl font-bold text-accent-500 mb-2">{gym.name}</h1>
        <p className="text-lg text-primary-300">{gym.address}</p>
        {/* Add more key info like contact if available directly on gym object */}
      </div>

      {/* Photo Gallery (Simple Carousel or Grid) */}
      {gym.photos && gym.photos.length > 0 && (
        <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {gym.photos.map((photoUrl, index) => (
            // Use standard img tag for external URLs
            <div key={index} className="aspect-video rounded-lg overflow-hidden shadow-lg">
              <img
                src={photoUrl}
                alt={`${gym.name} - Photo ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          ))}
          {/* This condition might not be needed if gym.photos check handles empty array */}
          {/* {gym.photos.length === 0 && <p className="text-primary-400">No photos available.</p>} */}
        </div>
      )}
      
      {/* Main Content Area */}
      <div className="grid md:grid-cols-3 gap-8">
        {/* Left Column: Details */}
        <div className="md:col-span-2 space-y-6">
          <div>
            <h2 className="text-3xl font-semibold text-primary-100 mb-3">Facilities</h2>
            <p className="text-primary-300 whitespace-pre-line">{gym.facilities_description || "Details not available."}</p>
          </div>
          <div>
            <h2 className="text-3xl font-semibold text-primary-100 mb-3">Contact</h2>
            <p className="text-primary-300">Phone: {gym.contact_phone || "N/A"}</p>
            <p className="text-primary-300">Email: {gym.contact_email || "N/A"}</p>
          </div>
        </div>

        {/* Right Column: Opening Hours & Quick Info */}
        <aside className="space-y-6">
          <div>
            <h2 className="text-3xl font-semibold text-primary-100 mb-3">Opening Hours</h2>
            <DisplayOpeningHours hours={gym.opening_hours} />
          </div>
        </aside>
      </div>

      {/* Memberships Section */}
      <div className="mt-12 pt-8 border-t border-primary-700">
        <h2 className="text-4xl font-bold text-center text-primary-100 mb-8">Membership Plans</h2>
        {gym.memberships && gym.memberships.length > 0 ? (
          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gym.memberships.map(membership => (
              <MembershipCard
                key={membership.id}
                membership={membership}
                gymId={gym.id}
                currentUserId={currentUserId}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-primary-400">No membership plans currently available for this gym.</p>
        )}
      </div>
    </div>
  );
}