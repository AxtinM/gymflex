"use client";

import { useState, useTransition } from 'react'; // Removed useEffect
import Link from 'next/link';
// import { getAllGyms } from "@/app/_lib/data-service"; // REMOVE direct data fetch
import { deleteGymAction } from "@/app/_lib/actions";
// import { toast } from 'react-hot-toast';

// Component to display a gym in the list
function GymListItem({ gym, onDeleteSuccess }) { // Changed prop name
  const [isDeleting, startDeleteTransition] = useTransition();

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete the gym "${gym.name}"? This will also delete all associated memberships, orders, events, and admin assignments.`)) {
      startDeleteTransition(async () => {
        const result = await deleteGymAction(gym.id);
        if (result?.error) {
          alert(`Error deleting gym: ${result.error}`);
          // toast.error(`Error deleting gym: ${result.error}`);
        } else {
          // toast.success("Gym deleted.");
          if (onDeleteSuccess) onDeleteSuccess(); // Call optional callback
        }
      });
    }
  };

  return (
    <div className="bg-primary-800 p-4 rounded-lg shadow flex justify-between items-center gap-4">
      <div>
        <h3 className="text-lg font-semibold text-accent-500">{gym.name}</h3>
        <p className="text-sm text-primary-300">{gym.address || "No address"}</p>
      </div>
      <div className="flex gap-2 flex-shrink-0">
         {/* Link to the Gym Admin edit page (reusing that form/action) */}
         <Link
            href={`/gym-admin/${gym.id}/dashboard/profile`}
            className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
         >
            Edit
         </Link>
         {/* Superadmin: Go to Gym Admin Dashboard */}
         <Link
            href={`/gym-admin/${gym.id}/dashboard`}
            className="text-sm bg-accent-600 hover:bg-accent-700 text-primary-900 px-3 py-1 rounded"
         >
            Go to Gym Admin Dashboard
         </Link>
        <button
          onClick={handleDelete}
          className="text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded disabled:opacity-50"
          disabled={isDeleting}
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  );
}


// This component now only displays the list and handles delete actions.
// It relies on the parent Server Component re-rendering with fresh data
// after a delete action triggers revalidation via the Server Action.
export default function GymList({ initialGyms = [] }) {
  // No need for internal gyms state, isLoading, or error state for re-fetching
  // const [gyms, setGyms] = useState(initialGyms || []);
  // const [isLoading, setIsLoading] = useState(false);
  // const [error, setError] = useState(null);

  // Removed refetchGyms function

  return (
     <div>
        <h2 className="text-2xl font-semibold text-primary-100 mb-4">Existing Gyms</h2>
        {/* Removed isLoading and error checks related to client-side refetch */}
        {initialGyms.length > 0 ? (
          <div className="space-y-4">
            {initialGyms.map(gym => (
              <GymListItem
                key={gym.id}
                gym={gym}
                onDeleteSuccess={null} // No client-side refetch needed here
              />
            ))}
          </div>
        ) : (
          <p className="text-primary-400">No gyms have been added yet.</p>
        )}
      </div>
  );
}