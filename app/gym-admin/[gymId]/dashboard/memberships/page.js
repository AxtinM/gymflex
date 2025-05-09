// Removed "use client"; - Now a Server Component

// import { useState, useEffect, useTransition } from 'react'; // Moved to Client Components
import { getGymById } from "@/app/_lib/data-service"; // Includes memberships
// import { createMembershipAction, updateMembershipAction, deleteMembershipAction } from "@/app/_lib/actions"; // Moved to Client Components
import CreateMembershipForm from "@/app/_components/gym-admin/CreateMembershipForm"; // Import Client Component
import MembershipList from "@/app/_components/gym-admin/MembershipList"; // Import Client Component
// import { toast } from 'react-hot-toast';

// Removed inline Input, Textarea, and MembershipListItem components

export default async function ManageMembershipsPage({ params }) { // Made async
  const { gymId } = params;
  // Removed client-side state and hooks
  // const [memberships, setMemberships] = useState([]);
  // const [isLoading, setIsLoading] = useState(true);
  // const [error, setError] = useState(null);
  // const [isPending, startTransition] = useTransition();
  // const [formError, setFormError] = useState(null);
  // const [formSuccess, setFormSuccess] = useState(null);
  // const formRef = useState(null);

  // Removed useEffect and fetchMemberships function

  // Fetch initial data on the server
  let initialMemberships = [];
  let fetchError = null;
  try {
    // getGymById includes memberships
    const gymData = await getGymById(gymId);
    initialMemberships = gymData.memberships || [];
  } catch (err) {
    console.error("Failed to load initial memberships:", err);
    fetchError = err.message || "Failed to load memberships.";
  }

  // Removed handleCreateSubmit function (handled in Client Component)

  return (
    <div>
      <h1 className="text-3xl font-bold text-primary-100 mb-6">Manage Memberships</h1>

      {/* Render CreateMembershipForm Client Component */}
      {/* onSuccess callback isn't strictly needed if MembershipList handles its own refresh */}
      <CreateMembershipForm gymId={gymId} onSuccess={null} />

      {/* Render MembershipList Client Component */}
      {fetchError ? (
         <p className="text-red-500 mt-8">Error loading memberships: {fetchError}</p>
      ) : (
         <MembershipList gymId={gymId} initialMemberships={initialMemberships} />
      )}
    </div>
  );
}
// Removed leftover Input, Textarea, and MembershipListItem function definitions