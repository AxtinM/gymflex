// Removed "use client"; - Now a Server Component

// import { useEffect, useState, useTransition } from "react"; // Moved to Client Component
import { getGymById } from "@/app/_lib/data-service";
// import { updateGymProfileAction } from "@/app/_lib/actions"; // Action called by Client Component
import EditGymProfileForm from "@/app/_components/gym-admin/EditGymProfileForm"; // Import Client Component
// import { toast } from "react-hot-toast"; // Moved to Client Component

// Removed inline Input and Textarea components (assuming they are shared or defined in EditGymProfileForm)

export default async function ManageGymProfilePage({ params }) { // Made async
  const { gymId } = params;
  // Removed client-side state and hooks
  // const [gym, setGym] = useState(null);
  // const [isLoadingGym, setIsLoadingGym] = useState(true);
  // const [errorLoadingGym, setErrorLoadingGym] = useState(null);
  // const [isPending, startTransition] = useTransition();
  // const [formError, setFormError] = useState(null);
  // const [formSuccess, setFormSuccess] = useState(null);

  // Removed useEffect for fetching data

  // Fetch data directly on the server
  let gym;
  let errorLoadingGym = null;
  try {
    gym = await getGymById(gymId);
  } catch (err) {
    console.error("Failed to load gym profile data:", err);
    errorLoadingGym = err.message || "Failed to load gym details.";
    // Optionally use notFound() from next/navigation if gym doesn't exist
    // if (err.message.includes('not found')) notFound();
  }

  // Removed client-side form submission handler

  // Handle loading and error states before rendering the form
  if (errorLoadingGym) return <p className="text-red-500 text-center py-8">Error: {errorLoadingGym}</p>;
  if (!gym) return <p className="text-primary-200 text-center py-8">Gym not found.</p>; // Or handle via notFound()

  // Removed default value calculations (handled within EditGymProfileForm)

  return (
    <div>
      <h1 className="text-3xl font-bold text-primary-100 mb-6">Manage Profile for {gym.name}</h1>
      {/* Render the Client Component, passing fetched data */}
      <EditGymProfileForm gym={gym} />
    </div>
  );
}
// Removed leftover Input and Textarea function definitions