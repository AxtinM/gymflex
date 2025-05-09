import Link from "next/link";
// import Image from "next/image"; // Removed next/image for external URLs

export default function GymCard({ gym }) {
  return (
    <div className="bg-primary-800 rounded-lg shadow-lg overflow-hidden transition-all hover:shadow-xl flex flex-col">
      {gym.main_image ? (
        // Use standard img tag for external URLs
        <div className="h-48 w-full overflow-hidden">
          <img
            src={gym.main_image}
            alt={`Image of ${gym.name}`}
            className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
            loading="lazy" // Add lazy loading
          />
        </div>
      ) : (
        <div className="h-48 w-full bg-primary-700 flex items-center justify-center"> {/* Adjusted height */}
          <span className="text-primary-500">No Image</span>
        </div>
      )}
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-2xl font-semibold text-accent-500 mb-2">{gym.name}</h3>
        <p className="text-sm text-primary-300 mb-1 truncate" title={gym.address || ""}>
          {gym.address || "Address not available"}
        </p>
        <p className="text-sm text-primary-400 mb-4 line-clamp-3 flex-grow">
          {gym.short_description || "No description available."}
        </p>
        {/* Removed inner <a> tag and applied classes to Link */}
        <Link
          href={`/gyms/${gym.id}`}
          className="mt-auto inline-block bg-accent-600 text-primary-800 text-sm font-semibold px-4 py-2 rounded-md hover:bg-accent-700 transition-colors text-center"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}