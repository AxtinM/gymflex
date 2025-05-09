"use client";

import { useState, useTransition } from 'react'; // Removed useEffect
// import { getAllGymAdminAssignments } from "@/app/_lib/data-service"; // Removed direct data fetch
import { removeGymAdminAction } from "@/app/_lib/actions";
// import { toast } from 'react-hot-toast';

function AssignmentRow({ assignment, onRemoveSuccess }) { // Changed prop name for clarity
  const [isRemoving, startRemoveTransition] = useTransition();

  const handleRemove = () => {
     if (confirm(`Are you sure you want to remove ${assignment.userName} as admin for ${assignment.gymName}?`)) {
        startRemoveTransition(async () => {
            const result = await removeGymAdminAction(assignment.userId, assignment.gymId);
            if (result?.error) {
                alert(`Error removing assignment: ${result.error}`);
                // toast.error(`Error removing assignment: ${result.error}`);
            } else {
                // toast.success("Assignment removed.");
                if (onRemoveSuccess) onRemoveSuccess(); // Call callback if provided (optional)
            }
        });
     }
  };

  return (
     <tr key={`${assignment.userId}-${assignment.gymId}`} className="hover:bg-primary-800">
        <td className="px-4 py-3 text-primary-200">{assignment.gymName}</td>
        <td className="px-4 py-3 text-primary-200">{assignment.userName}</td>
        <td className="px-4 py-3 text-sm text-primary-300">{assignment.userEmail}</td>
        <td className="px-4 py-3 text-right">
            <button 
              onClick={handleRemove}
              disabled={isRemoving}
              className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded disabled:opacity-50"
            >
              {isRemoving ? 'Removing...' : 'Remove'}
            </button>
        </td>
      </tr>
  );
}


// This component now only displays the list and handles delete actions.
// It relies on the parent Server Component re-rendering with fresh data
// after a delete action triggers revalidation via the Server Action.
export default function AdminAssignmentsList({ initialAssignments = [] }) {
  // No need for internal assignments state, isLoading, or error state for re-fetching
  // const [assignments, setAssignments] = useState(initialAssignments || []);
  // const [isLoading, setIsLoading] = useState(false);
  // const [error, setError] = useState(null);

  // Removed refetchAssignments function

  // The component receives initialAssignments and renders them.
  // The onRemoveSuccess callback in AssignmentRow is optional,
  // primarily for potential client-side UI updates if needed,
  // but the main data refresh comes from server revalidation.

  return (
     <div>
        <h2 className="text-2xl font-semibold text-primary-100 mb-4">Current Gym Admin Assignments</h2>
         <div className="overflow-x-auto bg-primary-900 rounded-lg shadow">
          <table className="min-w-full table-auto">
            <thead className="bg-primary-800 text-left">
              <tr>
                <th className="px-4 py-3 text-sm font-semibold text-primary-200 uppercase tracking-wider">Gym</th>
                <th className="px-4 py-3 text-sm font-semibold text-primary-200 uppercase tracking-wider">Admin User</th>
                <th className="px-4 py-3 text-sm font-semibold text-primary-200 uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-sm font-semibold text-primary-200 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary-800">
              {initialAssignments.length > 0 ? (
                initialAssignments.map(assign => (
                  <AssignmentRow
                    key={`${assign.userId}-${assign.gymId}`}
                    assignment={assign}
                    onRemoveSuccess={null} // No client-side refetch needed here
                  />
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-6 text-primary-400">No gym admin assignments found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
  );
}