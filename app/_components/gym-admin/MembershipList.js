"use client";

import { useState, useTransition } from 'react';
// import { getGymById } from "@/app/_lib/data-service"; // REMOVE unused import
import { deleteMembershipAction } from "@/app/_lib/actions";
// import { toast } from 'react-hot-toast';

// Component to display/edit a single membership
function MembershipListItem({ membership, gymId, onDeleteSuccess }) {
  const [isDeleting, startDeleteTransition] = useTransition();
  
  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete the "${membership.name}" membership? This cannot be undone.`)) {
      startDeleteTransition(async () => {
        const result = await deleteMembershipAction(membership.id, gymId);
        if (result?.error) {
          alert(`Error deleting: ${result.error}`);
          // toast.error(`Error deleting: ${result.error}`);
        } else {
          // toast.success("Membership deleted.");
          if (onDeleteSuccess) onDeleteSuccess(); // Trigger re-fetch in parent
        }
      });
    }
  };

  return (
    <div className="bg-primary-800 p-4 rounded-lg shadow flex justify-between items-center gap-4">
      <div>
        <h3 className="text-lg font-semibold text-accent-500">{membership.name}</h3>
        <p className="text-sm text-primary-300">Price: ${parseFloat(membership.price).toFixed(2)}</p>
        <p className="text-sm text-primary-300">Duration: {membership.duration || `${membership.duration_days} days`}</p>
        <p className="text-xs text-primary-400 mt-1">{membership.description}</p>
      </div>
      <div className="flex gap-2">
        {/* <button onClick={() => onEdit(membership)} className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded disabled:opacity-50" disabled={isDeleting}>Edit</button> */}
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
export default function MembershipList({ gymId, initialMemberships = [] }) {
  // No need for internal memberships state, isLoading, or error state for re-fetching
  // const [memberships, setMemberships] = useState(initialMemberships);
  // const [isLoading, setIsLoading] = useState(false);
  // const [error, setError] = useState(null);

  // Removed refetchMemberships function

  return (
     <div>
        <h2 className="text-2xl font-semibold text-primary-100 mb-4">Existing Plans</h2>
        {/* Removed isLoading and error checks related to client-side refetch */}
        {initialMemberships.length > 0 ? (
          <div className="space-y-4">
            {initialMemberships.map(mem => (
              <MembershipListItem
                key={mem.id}
                membership={mem}
                gymId={gymId}
                // onEdit={handleEdit} // TODO: Implement edit functionality
                onDeleteSuccess={null} // No client-side refetch needed here
              />
            ))}
          </div>
        ) : (
          <p className="text-primary-400">No membership plans have been added yet.</p>
        )}
      </div>
  );
}